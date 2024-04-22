import { useState} from 'react';
import { ethers } from 'ethers';
import Escrow from './artifacts/contracts/Escrow.sol/Escrow.json';
import './App.css'; 

const contractAddress = "0xfb2a314bf8A0b89800067D174121ac819E2a39FE";
function App() {
  const [contracts, setContracts] = useState([]);
  const [broker, setBroker] = useState('');
  const [beneficiary, setBeneficiary] = useState('');
  const [fundAmount, setFundAmount] = useState(0);
  const [releaseTime, setReleaseTime] = useState(0);
  const [transactionPending, setTransactionPending] = useState(false);
  
  // Deploy Escrow Contract Function
  async function deployEscrowContract() {
    if (typeof window.ethereum !== 'undefined') {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(contractAddress, Escrow.abi, signer);
      
      try {
        setTransactionPending(true);
        const transaction = await contract.setEscrowParams(broker, beneficiary, releaseTime);
        await transaction.wait();
        setTransactionPending(false);
        const deployedContract = {
          broker,
          beneficiary,
          fundAmount,
          releaseTime,
          escrowContract: contract,
          approvalPending: false,
          approvalConfirmed: false
        };
        setContracts([...contracts, deployedContract]);

        setTimeout(() => {
          setContracts(prevContracts => {
            return prevContracts.map(prevContract => {
              if (prevContract === deployedContract) {
                return {
                  ...prevContract,
                  approvalReady: true
                };
              }
              return prevContract;
            });
          });
        }, releaseTime * 1000);
      } catch (error) {
        console.error('Error deploying contract:', error);
        setTransactionPending(false);
      }
    }
  }

  // Approve Transfer Function 
  async function approveTransfer(escrowContract, index) {
    if (escrowContract) {
      try {
        const transaction = await escrowContract.approve();
        await transaction.wait();
  
        const updatedContracts = contracts.map((contract, i) => {
          if (i === index) {
            return {
              ...contract,
              approvalPending: false,
              approvalConfirmed: true
            };
          }
          return contract;
        });
  
        setContracts(updatedContracts);
      } catch (error) {
        console.error('Error approving transfer:', error);
        const updatedContracts = [...contracts];
        updatedContracts[index].approvalPending = false;
        setContracts(updatedContracts);
      }
    }
  }

  // Delete Contract Function
  async function deleteContract(escrowContract, index) {
    if (escrowContract) {
      try {
        const transaction = await escrowContract.deleteContract();
        await transaction.wait();
        const updatedContracts = [...contracts];
        updatedContracts.splice(index, 1);
        setContracts(updatedContracts);
      } catch (error) {
        console.error('Error deleting contract:', error);
      }
    }
  }

  // Render Escrow Details Function 
  function renderEscrowDetails(deployedContract, index) {
    return (
      <div key={index} className="card bg-light mb-3">
        <div className="card-body">
          <h3 className="card-title">Escrow Contracts</h3>
          <p className="card-text"><strong>Broker:</strong> {deployedContract.broker}</p>
          <p className="card-text"><strong>Beneficiary:</strong> {deployedContract.beneficiary}</p>
          <p className="card-text"><strong>Value:</strong> {deployedContract.fundAmount}</p>
          {deployedContract.approvalConfirmed ? (
            <p className="card-text text-success">✅ Fund Transfer Approved</p>
          ) : (
            <>
              {deployedContract.approvalReady && (
                <>
                  <button
                    onClick={() => approveTransfer(deployedContract.escrowContract, index)}
                    className="btn btn-info mr-2"
                    disabled={deployedContract.approvalPending}
                  >
                    {deployedContract.approvalPending ? 'Approving Transfer...' : 'Approve Fund Transfer'}
                  </button>
                  <button
                    onClick={() => deleteContract(deployedContract.escrowContract, index)}
                    className="btn btn-danger"
                  >
                    Delete Contract
                  </button>
                </>
              )}
            </>
          )}
        </div>
      </div>
    );
  }
  
  return (
    <div id="root">
      <div className="card bg-light mb-3">
        <div className="card-body">
          <h3 className="card-title">Create Escrow Contract</h3>
          <form onSubmit={(e) => { e.preventDefault(); deployEscrowContract(); }}>
            <div className="input-group">
              <label htmlFor="broker" className='mr-2'>Broker:</label>
              <input 
                type="text" 
                id="broker" 
                value={broker} 
                onChange={(e) => setBroker(e.target.value)} 
                className="form-control " 
                required 
              />
            </div>
            <div className="input-group">
              <label htmlFor="beneficiary" className='mr-2'>Fund Beneficiary:</label>
              <input 
                type="text" 
                id="beneficiary" 
                value={beneficiary} 
                onChange={(e) => setBeneficiary(e.target.value)} 
                className="form-control" 
                required 
              />
            </div>
            <div className="input-group">
              <label htmlFor="fundAmount" className='mr-2'>Fund Amount:</label>
              <input 
                type="number" 
                id="fundAmount" 
                value={fundAmount} 
                onChange={(e) => setFundAmount(e.target.value)} 
                className="form-control" 
                required 
              />
            </div>
            <div className="input-group">
              <label htmlFor="releaseTime" className='mr-2'>Release Time (Seconds):</label>
              <input 
                type="number" 
                id="releaseTime" 
                value={releaseTime} 
                onChange={(e) => setReleaseTime(e.target.value)} 
                className="form-control" 
                required 
              />
            </div>
            <button 
              type="submit" 
              className="btn btn-info mt-3" 
              disabled={transactionPending}
            >
              {transactionPending ? 'Deploying Contract...' : 'Deploy Contract'}
            </button>
          </form>
        </div>
      </div>
      {contracts.map((contract, index) => renderEscrowDetails(contract, index))}
    </div>
  );
}

export default App;