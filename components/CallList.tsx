// @ts-ignore
"use client";

import { useRouter } from 'next/navigation';
import { useGetCalls } from '../hooks/useGetCalls'
import { useEffect, useState } from 'react';
import { Call, CallRecording } from '@stream-io/video-react-sdk';
import MeetingCard from './MeetingCard';
import Loader from './Loader';

const CallList = ({ type }: { type: 'ended' | 'upcoming' | 'recordings' }) => {
    const { endedCalls, upcomingCalls, callRecordings, isLoading } = useGetCalls();
    const router = useRouter();
    const [recordings, setRecordings] = useState<CallRecording[]>([])

    const getCalls = () => {
        switch (type) {
            case 'ended':
                return endedCalls;
            case 'recordings':
                return recordings;
            case 'upcoming':
                return upcomingCalls;
            default:
                return [];
        }
    }

    const getNoCallsMessage = () => {
        switch (type) {
            case 'ended':
                return 'No Previous Calls';
            case 'recordings':
                return 'No Recordings';
            case 'upcoming':
                return 'No Upcoming Calls';
            default:
                return '';
        }
    }

    useEffect(() => {
        const fetchRecordings = async () => {
            const callData = await Promise.all(callRecordings?.map((meeting) => meeting.queryRecordings()) ?? [],);
            const recordings = callData.filter((call) => call.recordings.length > 0).flatMap((call) => call.recordings);
            setRecordings(recordings);
        };

        if (type === 'recordings') {
            fetchRecordings();
        }
    }, [type, callRecordings]);

    const calls = getCalls();
    const NoCallsMessage = getNoCallsMessage();

    if (isLoading) return <Loader />

    return (
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
            {calls && calls.length > 0 ? calls.map((meeting: Call | CallRecording) => (
                <MeetingCard
                    key={(meeting as Call).id}
                    icon={type === 'ended' ? '/icons/previous.png' : type === 'upcoming' ? '/icons/upcoming.png' : '/icons/Video.png'}
                    title={(meeting as Call).state?.custom?.description || (meeting as CallRecording).filename?.substring(0, 20) || 'Personal Meeting'}
                    date={(meeting as Call).state?.startsAt?.toLocaleString() || (meeting as CallRecording).start_time?.toLocaleString()}
                    isPreviousMeeting={type === 'ended'}
                    buttonIcon1={type === 'recordings' ? '/icons/play.svg' : undefined}
                    buttonText={type === 'recordings' ? 'Play' : 'Start'}
                    handleClick={type === 'recordings' ? () => router.push(`${(meeting as CallRecording).url}`) : () => router.push(`/${(meeting as Call).id}`)}
                    link={type === 'recordings' ? (meeting as CallRecording).url : `${process.env.NEXT_PUBLIC_BASE_URL}/${(meeting as Call).id}`}
                />
            )) : (
                <h1>{NoCallsMessage}</h1>
            )}
        </div>
    )
}

export default CallList
