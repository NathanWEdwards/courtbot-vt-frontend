const logger = {
    transports: {
        Console: jest.fn(),
        MongoDB: jest.fn()
    },
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn()
}

export default logger;