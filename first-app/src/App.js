import './App.css';
import { useState, useEffect, useId } from 'react';
import Web3 from "web3";
import abi from "./ABI.json";

function App() {
  const web3 = new Web3(window.ethereum);
  const [contract, setContract] = useState('');

  const [toDoList, setTodoList] = useState(() => {
    const savedList = localStorage.getItem("toDoList");
    const initialValue = JSON.parse(savedList);
    return initialValue || [];
  });
  const [inputValue, setInputValue] = useState("");
  const id = useId();
  const [title, setTitle] = useState("");
  useEffect(() => {
    async function loadContract() {
      // 1. Vérifiez si le fournisseur Ethereum est installé
      if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        // 2. Créez une nouvelle instance de web3
        if (accounts.length === 0) {
          await window.ethereum.enable(); // Demande à MetaMask l'autorisation d'accéder aux comptes
        }

        //console.log("account", accounts)

        // 3. Récupérez l'ABI du contrat
        const ABI = abi;
        // 4. Récupérez l'adresse du contrat
        const contractAddress = "0x3dffd7ddcd47b53f48c99c6f4958ab7c3c6df46b"; // Remplacez ceci par l'adresse de votre contrat

        // 5. Créez une nouvelle instance de contrat
        const contractInstance = new web3.eth.Contract(ABI, contractAddress);

        // 6. Mettez à jour l'état du contrat
        setContract(contractInstance);
      } else {
        alert("Veuillez installer un fournisseur Ethereum comme MetaMask");
      }
    }

    loadContract();
  }, [web3.eth.Contract]);

  // Maintenant, vous pouvez utiliser `contract` pour interagir avec votre contrat
  // Par exemple, pour appeler la méthode `getTask` :
  // async function getTask(id) {
  //   if (contract) {
  //     const task = await contract.methods.getTask(id).call();
  //     console.log("task :",task);
  //   }
  // }

  async function createTask() {
    console.log("createTask", contract, title,inputValue);
    if (contract) {
      // const task = await contract.methods.createTask(text).call();
      await contract.methods.createTask(title,inputValue).send({ from: '0x3dffd7ddcd47b53f48c99c6f4958ab7c3c6df46b' });
      // console.log(task);
      const newTask = {
        id: Date.now(),
        title,
        inputValue,
        completed: false,
      }
      console.log(id);
      setTodoList([...toDoList, newTask]);
      setInputValue('');
      setTitle('');
    }
  }

  async function toggleTask(id) {
    // console.log("toggle :", contract, inputValue);
    if (contract) {
      // const task = await contract.methods.createTask(text).call();
      await contract.methods.toggleCompleted(id).send({ from: '0x3dffd7ddcd47b53f48c99c6f4958ab7c3c6df46b' });
      // console.log(task);
      // console.log("id checkbox : ", id);
    }
    setTodoList(toDoList.map(task => {
      if (task.id === id) {
        console.log("Changed to ", !task.completed);
        return { ...task, completed: !task.completed };
      } else {
        return task;
      }
    }));
  }

  async function deleteThis(id) {
    if (contract) {
      await contract.methods.deleteTask(id).send({from: '0x3dffd7ddcd47b53f48c99c6f4958ab7c3c6df46b'});
    }
    handleDelete(id);
  }

  useEffect(() => {
    localStorage.setItem('toDoList', JSON.stringify(toDoList));
  }, [toDoList]);
  // function handleChange() {
  //   ToggleCheck(id);
  // }
  // function ToggleCheck(id) {

  // }
  // function handleSubmit(inputValue, title) {

  // }
  function handleDelete(id) {
    setTodoList(toDoList.filter(task => task.id !== id));
  }
  function DeleteAllChecked(checkStatus) {
    setTodoList(toDoList.filter(task => task.completed !== !checkStatus));
  }
  function DeleteAll() {
    localStorage.clear();
    setTodoList([]);
  }
  return (
    <div className="to-do-app">
      <header className="app-header">
        <h1>To-Do List</h1>
        <input type="text" placeholder='Add title' value={title} onChange={element => setTitle(element.target.value)} />
        <input type="text" placeholder="Add content" value={inputValue} onChange={element => setInputValue(element.target.value)} />
        <button className='submit-button' onClick={() => createTask()}>Submit</button>

        <h2 id="tasks-header">Tasks Remaining :</h2>
        <button className='delete-button' onClick={() => DeleteAllChecked(toDoList.completed)}>Delete checked tasks</button>
        <button className='delete-button' onClick={() => DeleteAll()}>Delete All</button>

        <div className='list-wrapper'>
          <ul>
            {toDoList.map(task => (
              <li key={task.id}> {task.title}
                <br />
                {task.inputValue}
                <input type="checkbox" checked={task.completed} onChange={() => { toggleTask(task.id) }} />
                <button className='delete-button' onClick={() => deleteThis(task.id)}>Delete</button>
                <hr />
              </li>
            ))}

          </ul>
        </div>
      </header>
    </div>
  );
}

export default App;
