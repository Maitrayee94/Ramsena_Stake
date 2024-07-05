
import st from "../../assets/icons/safe tick.webp"
import rcoin from "../../assets/icons/ramsenaCoin.webp"
import graf1 from "../../assets/icons/graf.svg"
import duration from "../../assets/icons/duration.svg"
import returns from "../../assets/icons/returns.svg"
import approveImg from "../../assets/icons/stake-approve-img.svg"
// import logo from "../../assets/icons/logo.webp"
import { useEffect, useRef, useState } from "react";
// import { Link } from "react-router-dom"
import stakeAbi1 from '../utils/stakeAbi1.json'
import stakeAbi2 from '../utils/stakeAbi2.json'
import tAbi from '../utils/tAbi.json';


import toast from "react-hot-toast";
import { useAccount } from "wagmi";
import Web3 from "web3";
import {
    prepareWriteContract,
    writeContract,
    waitForTransaction,
} from "@wagmi/core";


const StakeHero = () => {

    const webApi = new Web3("https://go.getblock.io/ca850a9859724d08a9e6b822a361caef");
    const [isOpen, setIsOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(0);
    const [TokenCount, setTokenCount] = useState("");
    const [APTpercentage, setAPTpercentage] = useState();
    const [grtApproveToken, setgrtApproveToken] = useState();
    const [ApprovedDone, setApprovedDone] = useState(false);
    const [reward, setReward] = useState("")
    const { isConnected, address } = useAccount();
    const [rightContainer, setrightContainer] = useState(true);
    
    const stakeC1 = "0xD32eD6E1cd0A1Ed3496a091b13652321265F260e";
    
    const tAddress = "0xbb51784a641472f7B4fC5af9CB4042bD52DE54a9";

    const [data1, setData1] = useState({
        approveAmt: ""
    });

    const [data, setData] = useState({
        amt: ""
    });
    const [referral, setReferral] = useState("");
    
    const tokenContract = new webApi.eth.Contract(tAbi, tAddress);

    useEffect(() => {
        calculateReward()
    }, [data.amt, APTpercentage])

    const calculateReward = () => {
        const rewardValue = !isNaN(data.amt) && selectedItem !== 0 ? ((APTpercentage / 100) * data.amt) + parseFloat(data.amt) : ""
        setReward(rewardValue)
        const tokenValue = !isNaN(data.amt) && selectedItem !== 0 ? ((APTpercentage / 100) * data.amt) : ""
        setTokenCount(tokenValue)
    }
    
    const approveTrx = async () => {
        if (!address || !isConnected) {
            toast.error("Please connect your wallet!");
            return;
        }
        try {
            console.log("Address", address);
            
            let amtValue = webApi.utils.toWei(data1.approveAmt.toString(), 'ether');
            console.log("Amount in Wei", amtValue);
    
            const usdtAmt = Number(amtValue) * 10 ** 18;
            console.log("USDT Amount in Wei", usdtAmt);
    
            const stakeAmt = usdtAmt;
            console.log("Stake Amount", stakeAmt);
    
            const approvalTransaction = await prepareWriteContract({
                address: tAddress,
                abi: tAbi,
                functionName: "approve",
                args: [stakeC1, stakeAmt],
                from: address,
            });
    
            console.log(approvalTransaction);
            const toastId = toast.loading("Approving transaction...");
            const hash = await writeContract(approvalTransaction);
            toast.loading("Processing Approval Transaction..", { id: toastId });
            await waitForTransaction(hash);
            toast.dismiss(toastId);
            toast.success("Approval completed successfully");
            setApprovedDone(true);
            window.location.reload();
        } catch (error) {
            toast.dismiss();
            toast.error("Error in approve transaction");
            console.error("Approval Transaction Error", error);
        }
    };
    
    
    const stakeToken = async () => {

        if (!address || !isConnected) {
            toast.error("Please connect your wallet!");
            return;
        }
    
        try {
            let amtValue = webApi.utils.toWei(data.amt.toString());
            const usdtAmt = amtValue;
            const stakeAmt = Number(usdtAmt);
    
            const tokenBalance = await tokenContract.methods.balanceOf(address).call();
            // console.log("Token balance", Number(tokenBalance));
            // console.log("stakeAmt", stakeAmt);
    
            if (Number(tokenBalance) < stakeAmt) {
                toast.error("Insufficient token balance for this transaction");
                return;
            }
    
            // if (allowance < stakeAmt) {
            //     toast.error("You don't have enough allowance for this transaction");
            //     return;
            // }
            // console.log("Token Allowance", allowance);
            // console.log("stakeAmt", stakeAmt);
    
            const stakeTransaction = await prepareWriteContract({
                address: stakeC1,
                abi: stakeAbi1,
                functionName: "stakeTokens",
                args: [stakeAmt, selectedItem, referral],
                from: address,
            });
    
            const toastId = toast.loading("Processing Stake Transaction..");
            await writeContract(stakeTransaction);
    
            toast.success("Stake Transaction completed successfully", { id: toastId });
            setData({ amt: "", duration: "" });
    
            setTimeout(() => {
                window.location.reload();
            }, 3000);
    
        } catch (error) {
            toast.dismiss();
            
            // Check for specific errors
            if (error.code === 4001) {
                // User rejected the transaction
                toast.error("Transaction rejected by user");
            } else if (error.message.includes("insufficient funds")) {
                // Insufficient funds error
                toast.error("Insufficient funds for gas");
            }  else {
                // Generic error message
                toast.error("Error in stake transaction");
            }
    
            console.error(error);
        }
    };
    


    const handlerightContainer = () => {
        setrightContainer(false);
    }

    const handleApprovetoken = (e) => {
        e.target.value <= 0 ? setgrtApproveToken("") : setgrtApproveToken(parseFloat(e.target.value))
    }


    const dropdownRef = useRef(null);

     

    useEffect(() => {
        const handleOutsideClick = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleOutsideClick);

        return () => {
            document.removeEventListener('mousedown', handleOutsideClick);
        };
    }, []);

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };

    const handleItemClick = (item, APYper) => {
        setSelectedItem(item);
        setAPTpercentage(APYper)
        setIsOpen(false);
    };
    //let reward = !isNaN(data) && selectedItem !== 0 ? (APTpercentage / 100) * data : "";

    return (
        <>
            <div id="hero-main" className=" min-h-[90vh]  flex items-center bg-[url('/bgimg/herobg.jpg')] bg-cover bg-center px-3  py-10  mx-5 phone:mx-2 my-10 rounded-[40px]   ">
                <div
                    className="absolute z-[-1] inset-0 h-full bg-black opacity-[0] rounded-[40px]"
                ></div>
                <div className="h-full w-full flex laptop:flex-col items-center justify-center ">

                    <div id="hero-left"
                        className="w-[55%] h-[100%] flex flex-col justify-center  gap-10 desktop:w-[100%]  desktop:mt-[50px]"
                    >

                        <div id="hero-left-top" className="  flex flex-col gap-8">

                            <h1 className=" text-[75px] font-normal relative  leading-tight  laptop:text-center desktop:text-[60px]  desktop:laptop:text-[50px]  desktop:laptop:phone:text-[30px]    ">

                                Earn rewards Staking up to 160.0%
                                 

                            </h1>

                            <p className=" flex leading-snug font-normal   text-[17px] w-[80%] tracking-[0.35px] desktop:w-[90%] laptop:text-center  laptop:m-auto desktop:phone:w-[100%] ">
                                Earn staking rewards every second with Ramsena, a staking token with slashing protection.Earn staking rewards every second with Ramsena, a staking token with slashing protection. Earn staking rewards every second with Ramsena, a staking token with slashing protection.

                            </p>
                        </div>
                    </div>

                    <div
                        id="hero-right"
                        className=" text-black relative z-10 laptop:mt-10 w-[40%] h-[100%] flex justify-center gap-0  desktop:w-[100%] "
                    >


                        <div id="hero-right-container"
                            className=" flex   flex-col py-5 justify-center gap-5     min-h-[600px]  w-[500px] max-w-[600px] overflow-hidden rounded-[30px]   bg-cover bg-opacity-80 bg-center  px-4"
                        >


                            <div className="flex items-center   justify-between phone:flex-col-reverse" >
                                <h2 className=" text-4xl font-normal">Stake Ramsena</h2>
                                <div className="flex items-center  justify-center gap-2 bg-gray-100   px-3 py-1 h-fit  rounded-lg w-fit" >
                                    <img loading="lazy" src={st} alt="" />
                                    <p className=" text-nowrap" >Safe & secured</p>
                                </div>
                            </div>
                            <p className=" tablet:text-center" >Stake Ramsena and earn staking rewards.</p>

                            <div>
                                <div className="relative mb-6">
                                    <div className=" absolute inset-y-0 start-0 mx-3 flex items-center   pointer-events-none">
                                        <img loading="lazy" src={rcoin} className="h-[30px]  w-[30px] " alt="" />
                                    </div>

                                    <input type="number" id="input-group-1" className="bg-gray-50 border border-gray-300 text-black text-sm rounded-lg  block w-full px-14 py-3 " placeholder=" Approve Token "
                                         value={data1.approveAmt}
                                         onChange={(e) => {
                                             const val = e.target.value.split("").filter((el) => !isNaN(el)).join("");
                                             setData1({
                                                 ...data1,
                                                 approveAmt: val,
                                             });
                                         }}
                                    />
                                    <button

                                        id="dropdownDefaultButton"
                                        onClick={approveTrx}
                                        className={` absolute inset-y-0 end-0 px-3 mx-3  my-2 rounded-lg text-white text-sm flex items-center ${ApprovedDone ? "bg-green-500" : "bg-gray-500"}        `}
                                        type="button"
                                    >

                                        {`${ApprovedDone ? "Approved" : "Approve token"}`}


                                    </button>

                                </div>

                                <div className="relative mb-6">
                                    <div className=" absolute inset-y-0 start-0 mx-3 flex items-center   pointer-events-none">
                                        <img loading="lazy" src={rcoin} className="h-[30px]  w-[30px] " alt="" />
                                    </div>

                                    <input type="number" id="input-group-2" className="bg-gray-50 border border-gray-300 text-black text-sm rounded-lg  block w-full px-14 py-3 " placeholder=" GrtPay Token Amount  "
                                        value={data.amt}
                                        onChange={(e) => {
                                            const val = e.target.value.split("").filter((el) => !isNaN(el)).join("");
                                            setData({
                                                ...data,
                                                amt: val,
                                            });
                                        }}
                                        />

                                </div>
                                <div className="relative mb-6">

                                    <input type="string" id="input-group-2" className="bg-gray-50 border border-gray-300 text-black text-sm rounded-lg  block w-full px-14 py-3 " placeholder=" Referral Address "
                                        value={referral}
                                        onChange={(e) => setReferral(e.target.value)}
                                        />

                                </div>

                                <div className="relative mb-6">
                                    <div className=" opacity-[0.5] absolute inset-y-0 start-0 mx-3 flex items-center   pointer-events-none">
                                        <img loading="lazy" src={duration} className="h-[30px]  w-[30px] " alt="" />
                                    </div>

                                    <input type="text" id="input-group-3" className="bg-gray-50 border border-gray-300 text-black text-sm rounded-lg  block w-full px-14 py-3         " placeholder=" Duration " value={selectedItem ? `${selectedItem} Days` : ""} disabled />


                                    <div ref={dropdownRef} className="  " >
                                        <button

                                            id="dropdownDefaultButton"
                                            onClick={toggleDropdown}
                                            className="absolute inset-y-0 end-0 px-5 mx-3 my-2 rounded-lg flex items-center  text-black   bg-gray-300  "
                                            type="button"
                                        >
                                            <svg className="w-2.5 h-2.5  " aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
                                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m1 1 4 4 4-4" />
                                            </svg>


                                        </button>
                                        {/* Dropdown menu */}
                                        {isOpen && (
                                            <div
                                                id="dropdown"
                                                className="z-10   absolute right-0  border-[#a5a5a5]  border-[2px] divide-y divide-gray-100 rounded-lg shadow w-44  bg-gray-800"
                                            >
                                                <ul className="  text-sm text-gray-200" aria-labelledby="dropdownDefaultButton">
                                                    <li className="   border-yellow-500 border-b-[1px] " >
                                                        <button
                                                            onClick={() => handleItemClick(360, 18)}
                                                            className="block w-full px-4 py-2    hover:bg-gray-600  hover:text-white"
                                                        >
                                                            360 Days
                                                        </button>
                                                    </li>
                                                    <li className="   border-yellow-500 border-b-[1px] ">
                                                        <button
                                                            onClick={() => handleItemClick(720, 40)}
                                                            className="block w-full px-4 py-2 hover:bg-gray-600 dark:hover:bg-gray-600 dark:hover:text-white"
                                                        >
                                                            720 Days
                                                        </button>
                                                    </li>
                                                    <li className="  border-yellow-500 border-b-[1px] ">
                                                        <button
                                                            onClick={() => handleItemClick(1080, 80)}
                                                            className="block w-full px-4 py-2 hover:bg-gray-600 dark:hover:bg-gray-600 dark:hover:text-white"
                                                        >
                                                            1080 Days
                                                        </button>
                                                    </li>
                                                    <li >
                                                        <button
                                                            onClick={() => handleItemClick(1440, 160)}
                                                            className="block w-full px-4 py-2 hover:bg-gray-600 dark:hover:bg-gray-600 dark:hover:text-white"
                                                        >
                                                            1440 Days
                                                        </button>
                                                    </li>

                                                </ul>
                                            </div>
                                        )}
                                    </div>




                                </div>

                                <div className="relative mb-6">
                                    <div className=" absolute opacity-[0.5] inset-y-0 start-0 mx-3 flex items-center   pointer-events-none">
                                        <img loading="lazy" src={returns} className="h-[30px]  w-[30px] " alt="" />
                                    </div>

                                    <input type="text" id="input-group-3" className="bg-gray-50 border border-gray-300 text-black text-sm rounded-lg  block w-full px-14 py-3         " value={reward} placeholder=" Returns " disabled />

                                </div>

                                <div className="flex justify-center" >

                                    <button type="submit" className=" bg-white w-fit text-black px-4 py-2  rounded-3xl  " onClick={stakeToken}>
                                        Stake Now
                                    </button>
                                </div>

                            </div>
                            <div className="flex  flex-col gap-2" >
                                <div className="flex justify-between" >
                                    <p className="text-gray-900" >You will receive</p>
                                    <p>{TokenCount}</p>
                                </div>
                                <div className="flex justify-between" >
                                    <p className="text-gray-900" >Returns</p>
                                    <p>{APTpercentage}%</p>
                                </div>
                                <div className="flex justify-between" >
                                    <p className="text-gray-900" >Token Price</p>
                                    <p>$2.2869</p>
                                </div>
                                <div className="flex justify-between" >
                                    <p className="text-gray-900" >Referral</p>
                                    <p>Nan</p>
                                </div>
                            </div>



                        </div>



                    </div>
                </div>


            </div>

            


            <div className=" px-14 py-2 w-full laptop:px-10 laptop:tablet:px-2    " >
                <div id="banner-main" className="  rounded-[10px] flex    gap-10 laptop:tablet:gap-5 flex-wrap justify-evenly">

                    <div id="banner-inner" className="flex gap-3 flex-col items-start justify-center rounded-2xl p-5 px-10 " >
                        <h5 className="text-lg text-white " >Token live price</h5>
                        <div className="flex gap-5" >

                            <p className="text-xl   " >$2.302</p>
                            <img className=" w-[7rem] " src={graf1} alt="" />
                        </div>
                    </div>

                    <div id="banner-inner" className="flex gap-3 flex-col items-start justify-center rounded-2xl p-5 px-10 " >
                        <h5 className="text-lg text-white " >Token live price</h5>
                        <div className="flex gap-5" >

                            <p className="text-xl   " >$2.302</p>
                            <img className=" w-[7rem] " src={graf1} alt="" />
                        </div>
                    </div>
                    <div id="banner-inner" className="flex gap-3 flex-col items-start justify-center rounded-2xl p-5 px-10 " >
                        <h5 className="text-lg text-white " >Token live price</h5>
                        <div className="flex gap-5" >

                            <p className="text-xl   " >$2.302</p>
                            <img className=" w-[7rem] " src={graf1} alt="" />
                        </div>
                    </div>
                    <div id="banner-inner" className="flex gap-3 flex-col items-start justify-center rounded-2xl p-5 px-10 " >
                        <h5 className="text-lg text-white " >Token live price</h5>
                        <div className="flex gap-5" >

                            <p className="text-xl   " >$2.302</p>
                            <img className=" w-[7rem] " src={graf1} alt="" />
                        </div>
                    </div>



                </div>
            </div>

        </>
    )
}

export default StakeHero