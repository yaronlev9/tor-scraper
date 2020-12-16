import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Paste from './Paste';
import './App.css';

function App() {
  const [pastesLst, setPastesLst] = useState([]);


  async function getData(){
    let res = await axios.get('api/pastes').then((res) => res.data);
    let lst = [];
    res.forEach((item) => {
      lst.push(<Paste obj={item}/>);
    });
    setPastesLst(lst);
  }

  useEffect( () => { getData()
    const dataInterval = setInterval(getData, 60000);
    return () => clearInterval(dataInterval);
  }, []);

  return (
    <div className="App">
      {pastesLst}
    </div>
  );
}

export default App;
