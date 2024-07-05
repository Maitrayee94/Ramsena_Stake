import copy from "../../assets/icons/copybtn.svg";
import { useEffect, useState } from "react";
import stakeAbi1 from "../utils/stakeAbi1.json";
import stakeAbi2 from "../utils/stakeAbi1.json";
import toast from "react-hot-toast";
import { useAccount } from "wagmi";
import Web3 from "web3";
import {
    prepareWriteContract,
    writeContract,
    waitForTransaction,
} from "@wagmi/core";

const StakingList = () => {
    const webApi = new Web3("https://go.getblock.io/42909f89bc1549cdb580305358939df7");
    const [copyStatus, setCopyStatus] = useState({});
    const { isConnected, address } = useAccount();
    const [userStakeCount, setUserStakeCount] = useState(0);
    const [userStakingList, setUserStakingList] = useState([]);
    const [currentData, setCurrentData] = useState('stakingList');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const data = {
        Refral: [
            ['#00124588962', 266, "5"],
            ['#00254588963', 25, "5"],
            ['#00124588964', 25, "5"],
            ['#00254588962', 25, "5"],
            ['#00124588962', 266, "5"],
            ['#00124588962', 266, "5"],
            ['#00254588962', 25, "5"],
            ['#00124588962', 25, "5"],
            ['#00254588962', 25, "5"],
            ['#00124588962', 266, "5"],
            ['#00124588962', 266, "5"],
            ['#00254588962', 25, "5"],
            ['#00124588962', 25, "5"],
            ['#00254588962', 25, "5"],
            ['#00124588962', 266, "5"],
            ['#00124588962', 266, "5"],
            ['#00254588962', 25, "5"],
            ['#00124588962', 25, "5"],
            ['#00254588962', 25, "5"],
            ['#00124588962', 266, "5"],
            // more data...
        ],
    };

    const totalPages = Math.ceil((currentData === 'stakingList' ? userStakingList : data[currentData]).length / itemsPerPage);
    const stakeA1 = "0xD32eD6E1cd0A1Ed3496a091b13652321265F260e";
    const StakeA2 = "0xb0CB23c9Fdd607DcD14AB7765087899D0D059356"

    const handleCopyReferralCode = (code, index) => {
        navigator.clipboard.writeText(code).then(() => {
            setCopyStatus(prevState => ({ ...prevState, [index]: true }));
            setTimeout(() => {
                setCopyStatus(prevState => ({ ...prevState, [index]: false }));
            }, 2000); // Hide the "Copied" message after 2 seconds
        }).catch(err => {
            console.error('Failed to copy text: ', err);
        });
    };

    const convertBlockTimeToLocal = (blockTime) => {
        const date = new Date(blockTime * 1000); // Convert seconds to milliseconds
        return date.toLocaleDateString();
    };

    const withdrawlStake = async (index) => {
        if (!address || !isConnected) {
            toast.error("Please connect your wallet!");
            return;
        }
        try {
            
            const contract1 = new webApi.eth.Contract(stakeAbi1, stakeA1);
            const userwithdrawStatus = await contract1.methods.withdrawalCompleted(address, index).call();
            console.log(userwithdrawStatus)
            const approvalTransaction = await prepareWriteContract({
                address: stakeA1,
                abi: stakeAbi1,
                functionName: "withdraw",
                args: [index],
                from: address,
            });
    
            //console.log(approvalTransaction);
            const toastId = toast.loading("Withdrawl In Process...");
            const hash = await writeContract(approvalTransaction);
            toast.loading("Processing Withdrawl Transaction..", { id: toastId });
            await waitForTransaction(hash);
            toast.dismiss(toastId);
            toast.success("Withdrawl successfully");
            window.location.reload();
        } catch (error) {
            toast.dismiss();
            toast.error("Error in Withdraw transaction");
            console.error(error);
        }
    };
    

    useEffect(() => {
        const fetchData1 = async () => {
            if (!address) {
                console.error("No address found");
                return;
            }

            try {
                const contract1 = new webApi.eth.Contract(stakeAbi1, stakeA1);
                const userStakeData1 = await contract1.methods.userStakingCount(address).call();
                setUserStakeCount(userStakeData1);

               

                const stakingList = [];
                for (let i = 0; i < userStakeData1; i++) {
                    const userStake = await contract1.methods.userStaking(address, i).call();
                    let returns = 0;
                    switch (parseInt(userStake[1])) {
                        case 360:
                            returns = (0.18 * parseFloat(webApi.utils.fromWei(userStake[0], 'ether'))) + parseFloat(webApi.utils.fromWei(userStake[0], 'ether')); // 18% return for duration 360
                            break;
                        case 720:
                            returns = 0.4 * parseFloat(webApi.utils.fromWei(userStake[0], 'ether'))+ parseFloat(webApi.utils.fromWei(userStake[0], 'ether')); // 40% return for duration 720
                            break;
                        case 1080:
                            returns = 0.8 * parseFloat(webApi.utils.fromWei(userStake[0], 'ether'))+ parseFloat(webApi.utils.fromWei(userStake[0], 'ether')); // 80% return for duration 1080
                            break;
                        case 1440:
                            returns = 1.6 * parseFloat(webApi.utils.fromWei(userStake[0], 'ether'))+ parseFloat(webApi.utils.fromWei(userStake[0], 'ether')); // 80% return for duration 1080
                            break;
                        default:
                            returns = 0; // Default to 0 if duration doesn't match known cases
                            break;
                    }
                    const currentDate = new Date(); // Current date and time
                    const endDate = new Date(userStake[3] * 1000); // End date from contract in milliseconds
    
                    const status = currentDate > endDate; // Check if current date is after end date
    
                    stakingList.push({
                        amount: webApi.utils.fromWei(userStake[0], 'ether'),
                        duration: userStake[1],
                        returns: returns ,
                        startDate: convertBlockTimeToLocal(userStake[2]),
                        endDate: convertBlockTimeToLocal(userStake[3]),
                        status: status
                    });
                }

                setUserStakingList(stakingList);

            } catch (error) {
                console.error("Error fetching data from contract:", error);
            }
        };

        fetchData1();
    }, [address]);

    const getCurrentPageData = () => {
        const dataset = currentData === 'stakingList' ? userStakingList : data[currentData];
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return dataset.slice(startIndex, endIndex);
    };

    const handleSwitchData = (type) => {
        setCurrentData(type);
        setCurrentPage(1);
    };

    const handlePageClick = (pageNumber) => {
        if (pageNumber !== "...") {
            setCurrentPage(pageNumber);
        }
    };

    const createPagination = () => {
        const pageNumbers = [];
        const visibleRange = 3;

        pageNumbers.push(1);

        if (totalPages <= visibleRange) {
            for (let i = 2; i <= totalPages; i++) {
                pageNumbers.push(i);
            }
        } else {
            let startRange = Math.max(2, currentPage - 1);
            let endRange = Math.min(totalPages - 1, currentPage + 1);

            if (startRange > 2) {
                pageNumbers.push('...');
            }

            for (let i = startRange; i <= endRange; i++) {
                pageNumbers.push(i);
            }

            if (endRange < totalPages - 1) {
                pageNumbers.push('...');
            }

            if (totalPages > 1) {
                pageNumbers.push(totalPages);
            }
        }

        return pageNumbers;
    };

    const currentPageData = getCurrentPageData();

    return (
        <div id="ref-main" className="my-10">
            <div className="mb-4 space-x-5 px-20 tablet:px-5 tablet:space-x-2">
                <button
                    onClick={() => handleSwitchData('stakingList')}
                    className={`px-5 py-1 ${currentData === 'stakingList' ? 'bg-yellow-500' : 'bg-gray-700'} text-white rounded-3xl`}
                >
                    Staked
                </button>
                <button
                    onClick={() => handleSwitchData('Refral')}
                    className={`px-5 py-1 ${currentData === 'Refral' ? 'bg-yellow-500' : 'bg-gray-700'} text-white rounded-3xl`}
                >
                    Refral
                </button>
            </div>
            <div className='px-20 tablet:px-5'>
                <div className="relative overflow-x-auto shadow-md rounded-lg">
                    <table className="w-full text-sm text-left text-gray-300">
                        <thead className="text-xs text-gray-200 uppercase bg-gray-800">
                            <tr className='font-bold text-sm tracking-wider'>
                                <th scope="col" className="px-6 py-3 text-nowrap">Sr no.</th>
                                {currentData === 'stakingList' && (
                                    <>
                                        <th scope="col" className="px-6 py-3">Amount</th>
                                        <th scope="col" className="px-6 py-3">Duration Days</th>
                                        <th scope="col" className="px-6 py-3">Returns</th>
                                        <th scope="col" className="px-6 py-3">Start Date</th>
                                        <th scope="col" className="px-6 py-3">End Date</th>
                                        <th scope="col" className="px-6 py-3">Status</th>
                                    </>
                                )}
                                {currentData === 'Refral' && (
                                    <>
                                        <th scope="col" className="px-6 py-3">Referral Address</th>
                                        <th scope="col" className="px-6 py-3">Amount</th>
                                        <th scope="col" className="px-6 py-3">Level</th>
                                    </>
                                )}
                            </tr>
                        </thead>
                        <tbody>
                            {currentPageData.map((row, index) => (
                                <tr key={index} className="bg-gray-950 border-b hover:bg-gray-800">
                                    <td className="px-6 py-3 text-white whitespace-nowrap">{index + 1 + (currentPage - 1) * itemsPerPage}</td>
                                    {currentData === 'stakingList' && (
                                        <>
                                            <td className="px-6 py-3 whitespace-nowrap">{row.amount}</td>
                                            <td className="px-6 py-3 whitespace-nowrap">{row.duration}</td>
                                            <td className="px-6 py-3 whitespace-nowrap">{row.returns}</td>
                                            <td className="px-6 py-3 whitespace-nowrap">{row.startDate}</td>
                                            <td className="px-6 py-3 whitespace-nowrap">{row.endDate}</td>
                                            <td className="px-6 py-3 whitespace-nowrap"><button className={`  ${row.status ? " active:scale-[0.9] transition-all ease-in-out " : ""}  `} onClick={() => withdrawlStake(index)} >
                                                        <span className={` ${row.status ? "bg-green-500" : "bg-gray-500"} text-white font-bold  px-3 py-1 rounded-2xl`} >  {row.status ? "Withdroll" : "Locked"}</span>
                                                    </button>

</td>
                                        </>
                                    )}
                                    {currentData === 'Refral' && (
                                        <>
                                            <td className="px-6 py-3 whitespace-nowrap">
                                                <div className="flex items-center space-x-2">
                                                    <span>{row[0]}</span>
                                                    <button onClick={() => handleCopyReferralCode(row[0], index)}>
                                                        <img src={copy} alt="Copy" className="w-4 h-4" />
                                                    </button>
                                                    {copyStatus[index] && (
                                                        <span className="text-green-500">Copied!</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-3 whitespace-nowrap">{row[1]}</td>
                                            <td className="px-6 py-3 whitespace-nowrap">{row[2]}</td>
                                        </>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <nav className="flex gap-2 items-center justify-end pt-4" aria-label="Table navigation">
                    <button
                        onClick={() => setCurrentPage(currentPage > 1 ? currentPage - 1 : 1)}
                        className="px-3 h-8 text-primary-gradient font-bold bg-gray-700 border-gray-600 rounded hover:text-white hover:bg-gray-600"
                        disabled={currentPage <= 1}
                    >
                        {"<<"}
                    </button>

                    <div className="inline-flex space-x-2 text-sm">
                        {createPagination().map((page, index) => (
                            <button
                                key={index}
                                onClick={() => handlePageClick(page)}
                                className={`px-3 h-8 border font-bold border-gray-600 rounded ${currentPage === page ? 'bg-gray-500 text-primary-gradient font-bold' : 'bg-gray-700 text-primary-gradient font-bold hover:text-white hover:bg-gray-600'}`}
                            >
                                {page}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={() => setCurrentPage(currentPage < totalPages ? currentPage + 1 : totalPages)}
                        className="px-3 h-8 text-primary-gradient font-bold bg-gray-700 border-gray-600 rounded hover:text-white hover:bg-gray-600"
                        disabled={currentPage >= totalPages}
                    >
                        {">>"}
                    </button>
                </nav>
            </div>
        </div>
    );
};

export default StakingList;
