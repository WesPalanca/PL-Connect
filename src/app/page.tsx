"use client";
import dynamic from "next/dynamic";

const Map = dynamic(() => import("@/components/Map"), { ssr: false });



const Home = () =>{
    return (
        <div>
            <h1>Welcome to PL Connect!</h1>
            <Map />

        </div>
    )
}



export default Home;