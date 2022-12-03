import { Mutex } from "async-mutex";

interface IIndexSignature {
  [key: string]: any;
}

type SchemaConfiguration = {
  collection?: string;
  timestamps?: boolean;
} | undefined;

class Schema<Type> {
  protected schema = {};
  protected configs: SchemaConfiguration;

  constructor(schema: Object, configs: SchemaConfiguration) {
    for (const [key, value] of Object.entries(schema)) {
      let propertyValue: any;
      if (Object.hasOwn(value, 'default')) {
        propertyValue = value.default;
      } else {
        propertyValue = undefined;
      }
      Object.defineProperty(this.schema, key, {
        value: propertyValue,
        enumerable: true,
        writable: true
      })
    }
    this.configs = configs;
  }

  document(params: IIndexSignature) {
    let document = {};
    for (const [key, fieldValue] of Object.entries(this.schema)) {
      let propertyValue: any;
      let paramsValue: any = params[key];

      if (paramsValue !== undefined) {
        propertyValue = paramsValue;
      } else {
        propertyValue = fieldValue;
      }

      Object.defineProperty(document, key, {
        value: propertyValue,
        enumerable: true,
        writable: true
      })
    }
    if (this.configs !== undefined && this.configs.timestamps === true) {
      const currentTime = new Date(Date.now());
      Object.defineProperty(document, 'createdAt', {
        value: currentTime,
        writable: true
      })
      Object.defineProperty(document, 'updatedAt', {
        value: currentTime,
        writable: true
      })
    }

    return document;
  }
}

class Model<Type> {
  protected data: Array<any> = [];
  protected mutex: Mutex = new Mutex();
  protected schema: Schema<Type>;

  constructor(schema: Schema<Type>) {
    this.schema = schema;
  }

  //eslint-disable-next-line @typescript-eslint/ban-types
  async create(params: Object) {
    await this.mutex.acquire();
    try {
      const document = this.schema.document(params);
      this.data.push(document);
    } finally {
      this.mutex.release();
    }    
  }

  //eslint-disable-next-line @typescript-eslint/ban-types
  countDocuments(params: typeof this.schema) {
    return {
      exec: async () => {
        const documents = await this._getDocuments(params);
        const count = documents.length;
        return count;
      }
    };
  }

  //eslint-disable-next-line @typescript-eslint/ban-types
  find(params: Object) {
    return { exec: async () => { return this._getDocuments(params) } };
  }

  findOne() {
    return {
      exec: async () => {
        await this.mutex.acquire();
        let document: any;
        try {
          if (this.data.length == 0) {
            document = undefined;
          } else {
            document = this.data[0];
          }
        } finally {
          this.mutex.release();
        }
        return document;
      }
    };
  }

  //eslint-disable-next-line @typescript-eslint/ban-types
  async _getDocuments(params: Object, condition?: string) {
    await this.mutex.acquire();
    let documents: Array<any>;
    try {
      let matchCondition = true;
      if (condition === 'filter') {
        matchCondition = false;
      }
      if (params !== undefined) {
        documents = this.data.filter((document) => {
          for (const [key, value] of Object.entries(params)) {
            const documentValue = document[key as keyof typeof document];
            if (Object.hasOwn(value, '$in') && value['$in'].includes(documentValue)) {
              return matchCondition;
            } else if (documentValue == value) {
              return matchCondition;
            } else {
              return !matchCondition;
            }
          }
        });
      } else {
        documents = this.data;
      }
    } finally {
      this.mutex.release();
    }
    return documents;
  }

  //eslint-disable-next-line @typescript-eslint/ban-types
  remove(params: Object) {
    return {
      exec: async () => {
        const documents = await this._getDocuments(params, 'filter');
        await this.mutex.acquire();
        try {
          this.data = documents;
        } finally {
          this.mutex.release();
        }
      }
    };
  }
}

const mongoose = {
  createConnection: jest.fn().mockImplementation(function (_args: any) {
    return {
      model: jest.fn().mockImplementation(function (_: any, schema: any) {
        return new Model(schema);
      }),
    };
  }),
  Connection: jest.fn(),
  Schema,
  Model,
};

module.exports = mongoose;
