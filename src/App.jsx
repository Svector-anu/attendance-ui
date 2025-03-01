// src/App.js
import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import './App.css';
import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { useAppKit } from '@reown/appkit/react'
// adeded reown app kiit


function App() {
  const [currentAccount, setCurrentAccount] = useState("");
  //const [isConnected, setIsConnected] = useState(false);
  const [attendanceData, setAttendanceData] = useState(() => {
    const savedData = localStorage.getItem('attendanceData');
    return savedData ? JSON.parse(savedData) : initializeAttendanceData();
  });
  const [currentWeek, setCurrentWeek] = useState(1);
  const { open } = useAppKit()
  const {isConnected} = useConnect()
  const { disconnect } = useDisconnect()

  useEffect(() => {
    localStorage.setItem('attendanceData', JSON.stringify(attendanceData));
  }, [attendanceData]);

  function initializeAttendanceData() {
    const days = ['thursday', 'friday', 'saturday', 'sunday'];
    const data = {};
    
    for (let week = 1; week <= 7; week++) {
      data[week] = {};
      for (let day of days) {
        data[week][day] = false;
      }
    }
    
    return data;
  }

  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Please install MetaMask!");
        return;
      }

      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });

      setCurrentAccount(accounts[0]);
      isConnected(true);
      console.log("Connected", accounts[0]);
    } catch (error) {
      console.log(error);
    }
  };

  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log("Make sure you have MetaMask!");
        return;
      }

      const accounts = await ethereum.request({ method: "eth_accounts" });

      if (accounts.length !== 0) {
        const account = accounts[0];
        setCurrentAccount(account);
        isConnected(true);
      } else {
        console.log("No authorized account found");
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

  const markAttendance = (week, day) => {
    setAttendanceData(prevData => {
      const newData = {...prevData};
      newData[week][day] = !newData[week][day];
      return newData;
    });
  };

  const handleWeekChange = (event) => {
    setCurrentWeek(parseInt(event.target.value));
  };

  const days = ['thursday', 'friday', 'saturday', 'sunday'];
  
  const renderAttendanceTable = () => {
    return (
      <div className="attendance-table">
        <h2>Week {currentWeek} Attendance</h2>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                {days.map(day => (
                  <th key={day}>{day.charAt(0).toUpperCase() + day.slice(1)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                {days.map(day => (
                  <td key={day}>
                    <button 
                      className={`attendance-btn ${attendanceData[currentWeek][day] ? 'present' : 'present'}`}
                      onClick={() => markAttendance(currentWeek, day)}
                      disabled={!isConnected}
                    >
                      {attendanceData[currentWeek][day] ? 'Present' : 'present'}
                    </button>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderWeekSelector = () => {
    const weeks = Array.from({ length: 7 }, (_, i) => i + 1);
    
    return (
      <div className="week-selector">
        <label htmlFor="week-select">Select Week: </label>
        <select id="week-select" value={currentWeek} onChange={handleWeekChange}>
          {weeks.map(week => (
            <option key={week} value={week}>Week {week}</option>
          ))}
        </select>
      </div>
    );
  };

  const renderAttendanceSummary = () => {
    const summary = [];
    
    for (let week = 1; week <= 7; week++) {
      const presentCount = Object.values(attendanceData[week]).filter(Boolean).length;
      const totalDays = Object.keys(attendanceData[week]).length;
      
      summary.push({
        week,
        present: presentCount,
        total: totalDays,
        percentage: Math.round((presentCount / totalDays) * 100)
      });
    }
    
    return (
      <div className="attendance-summary">
        <h2>Attendance Summary</h2>
        <table>
          <thead>
            <tr>
              <th>Week</th>
              <th>Attendance</th>
              <th>Percentage</th>
            </tr>
          </thead>
          <tbody>
            {summary.map(item => (
              <tr key={item.week}>
                <td>Week {item.week}</td>
                <td>{item.present}/{item.total} days</td>
                <td>{item.percentage}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Web3 Attendance Tracker</h1>
            
      {isConnected ? (
        <button onClick={() => disconnect()}>Disconnect</button>
      ) : (
        <button onClick={() => open()}>Connect Wallet</button>
      )}
      </header>
      <main>
        {renderWeekSelector()}
        {renderAttendanceTable()}
        {isConnected && renderAttendanceSummary()}
      </main>
    </div>
  );
}

export default App;