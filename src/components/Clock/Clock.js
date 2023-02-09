import React, { useEffect, useState } from "react";

function Clock() {
    const [clockState, setClockState] = useState();
    useEffect(() => {
        const fetchData = async () => {
            try {
                const date = new Date();
                setClockState(date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
            } catch (error) {
                console.error(error.message);
            }
        }
        fetchData();
    }, []);


    return < >{clockState}</>;
}

export default Clock;