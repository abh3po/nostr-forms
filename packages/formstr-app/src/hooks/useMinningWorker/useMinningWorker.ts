import {Event, UnsignedEvent} from "nostr-tools";
import {MiningTracker} from "../../nostr/poll";
import React from "react";

export const useMiningWorker = ( difficulty: number) => {
    const trackerRef = React.useRef(new MiningTracker())
    const [progress, updateProgress] = React.useState({
        maxDifficultyAchieved: 0,
        numHashes: 0
    })
    const [isCompleted, setIsCompleted] = React.useState(false)
    const workerRef = React.useRef<null | Worker>(null)
    React.useEffect(() => {
        return ()=> {
            if(workerRef.current) {
                workerRef.current.terminate()
            }
        }
    }, [])
    const minePow = (event: UnsignedEvent,) => {
        if(workerRef.current) {
            workerRef.current.terminate()
        }
        const worker = new Worker(new URL("../../utils/minning-worker", import.meta.url))
        trackerRef.current = new MiningTracker()
        workerRef.current = worker
        const tracker = trackerRef.current
        worker.postMessage({ event, difficulty, tracker: tracker })
        return new Promise<Omit<Event, "sig">>((resolve) => {
            worker.onmessage = (event) => {
                if(event.data.status === 'progress') {
                    updateProgress({
                        maxDifficultyAchieved: event.data.tracker.maxDifficultySoFar,
                        numHashes: event.data.numHashes
                    })
                } else if(event.data.status ==='completed') {
                    trackerRef.current = event.data.tracker
                    setIsCompleted(true)
                    worker.terminate()
                    resolve({...event, ...event.data.event} as Omit<Event, "sig">)
                }
            }
        })
    }
    const cancelMining = () => {
        if(workerRef.current) {
            workerRef.current.terminate()
        }
        trackerRef.current.cancel()
        updateProgress({numHashes: 0, maxDifficultyAchieved: 0})
    }
    return {
        minePow,
        isCompleted,
        cancelMining,
        progress
    }
}