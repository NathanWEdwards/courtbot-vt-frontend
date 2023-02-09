import { XMLParser } from 'fast-xml-parser';
import fs from 'fs';
import { InferGetServerSidePropsType } from 'next';
import Head from 'next/head';
import path from 'path';
import { ChangeEvent, createRef, FormEvent, useEffect, useRef, useState, } from 'react';

export default function Sms({ instances }: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const [ messages, setMessages] = useState<string[]>([]);
  const [ formData, setFormData ] = useState<{message: any}>({message: ''});
  const [ instance, setInstance ] = useState<string>(instances[0]);
  const [ state, setState ] = useState<string>('idle');

  let cookies = '{}';
  const textareaRef = createRef<HTMLTextAreaElement>();
  const parser = new XMLParser();

  const changeInstance = (event: ChangeEvent<HTMLSelectElement>) => {
    setInstance(event.target.value);
  }

  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const target = event?.target as HTMLTextAreaElement;
    setFormData({
      ...formData,
      [target?.name]: target?.value,
    });
  };

  const onSend = (ev: FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    fetch(`/api/sms/${instance}`,
      {
        method: 'POST',
        credentials: 'include',
        headers: {
          Cookie: JSON.stringify({
            state: state
          })
        },
        body: JSON.stringify({
          Body: formData!.message,
          From: '01234567890'
        })
      }).then((res) => {
        res.text().then((text) => {
          const response = parser.parse(text);
          setMessages([
            ...messages,
            response.Response.Message
          ]);
        })
        
      });
      setFormData({
        message: '',
      });
  };

  return (
    <div className="flex flex-col h-screen">
      <Head>
        <title>SMS Tester</title>
      </Head>

      <div className="flex-none text-xl">
        <h1 className="text-6xl font-black text-center mb-8 text-green-700">
          SMS Tester
        </h1>
      </div>

      <label>
        <select aria-label='courtbot-instances' value={instance} onChange={changeInstance}>
          {instances.map((instanceOption)=> {
            return <option key={instanceOption} value={instanceOption}>{instanceOption.toUpperCase()}</option>
          })}
        </select> Instance
      </label>
      <div className="grow">
        <ul>
          {Object.entries(messages).map(([idx, message]) => {
            return <li key={idx}>{message}</li>
          })}
        </ul>
      </div>

      <div className="flex-none">
        <form onSubmit={onSend}>
          <textarea ref={textareaRef} onChange={handleChange} name="message"/>
          <button type="submit">
            Send
          </button>
        </form>
      </div>
    </div>
  )
}

export async function getServerSideProps() {
  const instanceDirectory = path.join(process.cwd(), '/instances/');
  const directoryContents = fs.readdirSync(instanceDirectory);
  const instances = directoryContents.filter((item) => {
      return fs.statSync(path.join(instanceDirectory, item)).isDirectory();
  });
  return {
    props: { instances }
  }
}
