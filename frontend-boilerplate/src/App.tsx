import React, { useEffect, useState } from 'react';
import './App.css';
import { PetitionContractAbi__factory } from './contracts';
import { DateTime} from '@fuel-ts/utils';
import { Provider,BN } from 'fuels';
import CreateCampaignForm from './CreateCampaignForm';
import PetitionForm from './PetitionForm';
import Modal from './Modal';
import {
  useConnectUI,
  useIsConnected,
  useDisconnect,
  useWallet,
  useFuel
} from '@fuels/react';

const CONTRACT_ID = 0x62fa7814d3c56902e781b34f95a1703c68d4901c47e2358ed12b674c569a1f23;

function App() {
  const [showModal, setShowModal] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalContent, setModalContent] = useState('');
  const { connect } = useConnectUI();
  const { disconnect } = useDisconnect();
  const { isConnected } = useIsConnected();
  const { wallet } = useWallet();

   const displayModal = (title: string, content: string) => {
    setModalTitle(title);
    setModalContent(content);
    setShowModal(true);
  };

  const connect_wallet = async () => {
        try {
          connect();
        } catch (err) {
            console.error('error connecting: ', err);
        }
    }  

  const disconnect_wallet = () => {
    disconnect();
  }

  async function getDeadline(deadlineDays: number) {
    const provider = await Provider.create('https://testnet.fuel.network/v1/graphql');
    const block = await provider.getBlock('latest');
    console.log('block',block)
    if (!block || !block.time) {
      throw new Error('Failed to fetch the latest block or block timestamp.');
    }
    const currentTimestamp = DateTime.fromTai64(block.time);
    const oneDayInSeconds = 24 * 60 * 60;
    const deadline = currentTimestamp.toUnixSeconds() + (oneDayInSeconds * deadlineDays)
    console.log('deadline',deadline);
    return deadline;
  }

function convertBNToDate(timestampBN: BN | undefined): string | null {
  if (timestampBN === undefined) {
    return null;
  }
  const numericValueInMilliseconds = (Number(timestampBN.toString(10))) * 1000;
  const dateObject = new Date(numericValueInMilliseconds); 

  return dateObject.toLocaleString('en-US');
  } 

async function createCampaign(deadline: number) {
    if (isConnected && wallet) {
      const contract = PetitionContractAbi__factory.connect(CONTRACT_ID, wallet);
      console.log(contract);
      const deadlineStamp = await getDeadline(deadline);
      const {logs} = await contract.functions.create_campaign(deadlineStamp).call()
      const campaignLog = logs[0];

      const deadlineTimestamp = new Date((campaignLog.campaign_info?.deadline?.toString(10)) * 1000);
      const campaignId = campaignLog.campaign_id?.toString(10);
      const progress = campaignLog.campaign_info?.state;
      displayModal("Campaign Created", `
      Deadline: ${deadlineTimestamp.toLocaleString('en-US')}
      Campaign ID: ${campaignId}
      Current State: ${progress}
    `);
    }
  }

  async function signPetition(campaignId: number) {
    if (isConnected && wallet) {
      const contract = PetitionContractAbi__factory.connect(CONTRACT_ID, wallet);      
      const {logs} = await contract.functions.sign_petition(campaignId).call();
      const signLog = logs[0];
      displayModal("Petition Signed", `Campaign ID Signed: ${signLog.campaign_id?.toString(10)}`);

    }
  }

  async function cancelPetition(campaignId: number) {
    if (isConnected && wallet) {
      const contract = PetitionContractAbi__factory.connect(CONTRACT_ID, wallet);      
      const {logs} = await contract.functions.cancel_campaign(campaignId).call();
      const cancelLog = logs[0];
      displayModal("Campaign Cancelled", `Campaign ID Cancelled: ${cancelLog.campaign_id?.toString(10)}`);

    }
  }

   async function unsignPetition(campaignId: number) {
    if (isConnected && wallet) {
      const contract = PetitionContractAbi__factory.connect(CONTRACT_ID, wallet);      
      const {logs} = await contract.functions.unsign_petition(campaignId).call()
      displayModal("Campaign Unsigned", `Campaign ID Unsigned: ${logs[0].campaign_id?.toString(10)}`);
    }
  }

  async function campaignInfo(campaignId: number) {
    if (isConnected && wallet) {
      const contract = PetitionContractAbi__factory.connect(CONTRACT_ID, wallet);      
      const {value} = await contract.functions.campaign_info(campaignId).call()
      const deadlineTimestamp = await convertBNToDate(value?.deadline);
      console.log(value?.deadline.toString());
      const state = value?.state;
      const signs = value?.total_signs.toString();
      displayModal("Campaign Info", `
      Deadline: ${deadlineTimestamp}
      Progress: ${state}
      Total Signs Received: ${signs}
    `);

    }
  }
  async function endCampaign(campaignId: number) {
    if (isConnected && wallet) {
      const contract = PetitionContractAbi__factory.connect(CONTRACT_ID, wallet);      
      const {logs} = await contract.functions.end_campaign(campaignId).call()
      const campaignLog = logs[0];
      const id = campaignLog.campaign_id?.toString(10);
      const total_sign = campaignLog.total_signs?.toString(10);
      displayModal("Campaign Ended", `
      Campaign ID: ${id}
      Total Signs Received: ${total_sign}
    `);
    }
  }
  return (
    <div className="App">
        <h1>Petition dApp</h1>
        {isConnected ? (
          <button onClick={disconnect_wallet} className="disconnect-button">
            Disconnect Wallet
          </button>
        ) : (
          <button onClick={connect_wallet} className="connect-button">
            Connect Wallet
          </button>
        )}
      {isConnected && (
        <main className="App-main">
          <CreateCampaignForm onSubmit={createCampaign} />
          <div className="form-container">
            <PetitionForm onSubmit={signPetition} label="Sign" action="sign" />
            <PetitionForm onSubmit={endCampaign} label="End" action="end campaign" />
            <PetitionForm onSubmit={campaignInfo} label="Info" action="view campaign info" />
            <PetitionForm onSubmit={unsignPetition} label="Unsign" action="unsign" />
            <PetitionForm onSubmit={cancelPetition} label="Cancel" action="cancel" />
            <p className="footer-text">Powered by <a className="ref-link" href="http://metaschool.so/" target="_blank" rel="noopener noreferrer">metaschool 🔮</a></p>
          </div>
        </main>
      )}
      <Modal
        show={showModal}
        title={modalTitle}
        content={<pre>{modalContent}</pre>}
        onClose={() => setShowModal(false)}
      />
    </div>
  );
      }  

export default App;
