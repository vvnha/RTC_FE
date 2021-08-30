import { React, useEffect, useRef, useState, createRef, useMemo } from 'react';
// import PropTypes from 'prop-types';
import './Live.scss';
import Peer from 'peerjs';
import io from "socket.io-client";
import faker from "faker";

Viewer.propTypes = {

};


const nameUser = faker.name.findName();
const roomId = "abcd";

const serverLink = "ec2-user@ec2-18-140-5-56.ap-southeast-1.compute.amazonaws.com";
// const serverLink = "localhost"
const link = `http://${serverLink}:5000`;

const socket = io.connect(link)
const chatSocket = io.connect(link);

const Video = ({ stream, userName }) => {
    const localVideo = createRef();

    useEffect(() => {
        if (localVideo.current) localVideo.current.srcObject = stream;
    }, [stream, localVideo]);

    return (
        <div id="Div1">
            <p>{userName}</p>
            <video ref={localVideo} autoPlay />
        </div>
    );
};

const myPeer = new Peer();
myPeer.on('open', (id) => {
    socket.emit('join-room', roomId, id, nameUser)
});

function Viewer(props) {
    const myVideo = useRef();
    const [users, setUsers] = useState([]);
    const [newUsers, setNewUsers] = useState([]);
    const [stream, setStream] = useState();
    const [listStream, setlistStream] = useState([]);



    useEffect(() => {
        const getUserMedia = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                stream.getAudioTracks()[0].enabled = false;
                stream.getVideoTracks()[0].enabled = false;
                setStream(stream)
                stream.getVideoTracks()[0].stop();
                //myVideo.current.srcObject = stream;


                myPeer.on('call', call => {
                    call.answer(null);
                    call.on('stream', (userVideoStream) => {
                        addStream(userVideoStream, call.peer, call.metadata.userName)
                    })
                })

            } catch (err) {
                console.log(err);
            }
        };
        getUserMedia();
    }, [])

    useEffect(() => {
        socket.on('user-disconnected', peerId => {
            console.log(peerId);
            removeStream(listStream, peerId);
        })
    })



    const addStream = (userVideoStream, peerId, userName) => {
        setlistStream(list => {
            const newList = [...list, { peerId, videoStream: userVideoStream, userName }];
            const unique = [...new Map(newList.map(item => [item['peerId'], item])).values()];
            return (unique)
        })
    }

    const removeStream = (streams, peerId) => {
        setlistStream(list => list.filter(stream => stream.peerId !== peerId));
    }

    const ListVideo = () => {
        const ShowListVideos = useMemo(() => {
            return listStream.map(
                (s, i) => <Video key={s.peerId} stream={s.videoStream} userName={s.userName} />
            )
        })
        return ShowListVideos;
    }

    return (
        <div>
            <div id="video-grid">
                {ListVideo()}
            </div>
        </div>
    );
}

export default Viewer;