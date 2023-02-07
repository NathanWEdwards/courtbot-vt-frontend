import Head from 'next/head'
import { ChangeEvent, createRef, FormEvent, useEffect, useRef, useState, } from 'react';
import { XMLParser } from 'fast-xml-parser';

// todo
const initialInstance = () => {
  return 'vt';
}
export default function Sms() {
  const [ messages, setMessages] = useState<string[]>([]);
  const [ formData, setFormData ] = useState<{message: any}>({message: ''});
  const [ state, setState ] = useState<string>('idle');
  const instance = useState(initialInstance());
  let cookies = '{}';
  const textareaRef = createRef<HTMLTextAreaElement>();
  // todo: get/select instance
  const instanceRef = createRef<HTMLSelectElement>();

  const parser = new XMLParser();

  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const target = event?.target as HTMLTextAreaElement;
    setFormData({
      ...formData,
      [target?.name]: target?.value,
    });
  };

  const onSend = (ev: FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    fetch(`/api/sms/${instance[0]}`,
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
        cookies = res.headers.get('cookies') || '';
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

      <select ref={instanceRef}>
        <option value="vt">VT</option>  
      </select>
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

