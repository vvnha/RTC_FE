import { React, useEffect, useRef, useState, createRef, useMemo, useCallback } from 'react';
// import PropTypes from 'prop-types';
import './Stream.scss';
import Peer from 'peerjs';
import io from "socket.io-client";
import faker from "faker";

Stream.propTypes = {

};

const nameUser = faker.name.findName();
const roomId = "abcd"

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

const ShowMessages = ({ message }) => {
    return (
        <li>{message}</li>
    );
};


const myPeer = new Peer();
myPeer.on('open', (id) => {
    socket.emit('join-room', roomId, id, nameUser)
});

function Stream(props) {
    const myVideo = useRef();
    const [users, setUsers] = useState([]);
    const [message, setMessage] = useState('');
    const [listMessages, setListMessages] = useState([]);
    const [newUsers, setNewUsers] = useState([]);
    const [stream, setStream] = useState();
    const [listStream, setlistStream] = useState([]);
    const [muteStatus, setmuteStatus] = useState('unmute');
    const [cameraStatus, setCameraStatus] = useState('hide Camera');
    const [screenStatus, setScreenStatus] = useState(false);
    const [screenPeer, setScreenPeer] = useState(null);
    const [screenStream, setScreenStream] = useState(null);


    useEffect(() => {
        const getUserMedia = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                stream.getAudioTracks()[0].enabled = false;
                stream.getVideoTracks()[0].enabled = true;
                setStream(stream)
                myVideo.current.srcObject = stream;

                myPeer.on('call', async call => {
                    var tempVideo = listStream;
                    call.answer(stream);
                    call.on('stream', (userVideoStream) => {
                        console.log();
                        AddStream(userVideoStream, call.peer, call.metadata.userName)
                    });
                    call.on('close', () => {
                        alert('ok')
                    })
                })

                socket.on('user-connected', (user) => {
                    setNewUsers([...users, user]);
                    const call = myPeer.call(user.peerId, stream, { metadata: { userName: nameUser } });
                    call.on('stream', userVideoStream => {
                        AddStream(userVideoStream, call.peer, user.userName)
                    })
                })

                socket.on('message-list', rs => {
                    setListMessages(list => [...list, rs])
                })

            } catch (err) {
                console.log(err);
            }
        };
        getUserMedia();
    }, [])

    useEffect(() => {
        socket.on('user-disconnected', peerId => {
            RemoveStream(peerId);
        })

        //handle when click button stop sharing
        if (screenStream !== null) {
            screenStream.getVideoTracks()[0].onended = function () {
                setScreenStatus(false);
                RemoveStream(null);
                socket.emit('user-disconnect', screenPeer.id);
                screenPeer.destroy();
            };
        }
    })


    const handleMuteButton = () => {
        var mediaStream = stream;
        var audio = mediaStream.getAudioTracks()[0];
        audio.enabled = !audio.enabled;
        setStream(mediaStream);

        const status = audio.enabled === true ? 'mute' : 'umute';
        setmuteStatus(status);
    }

    const handleHideCameraButton = () => {
        var mediaStream = stream;
        var video = mediaStream.getVideoTracks()[0];
        video.enabled = !video.enabled;
        setStream(mediaStream);

        const status = video.enabled === true ? 'Hide Camera' : 'Show Camera';
        setCameraStatus(status);
    }

    const handleShareScreen = async () => {
        const status = screenStatus;
        if (status === false) {
            const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
            setScreenStatus(!status);
            setScreenStream(screenStream)

            const newPeer = new Peer();
            setScreenPeer(newPeer)

            newPeer.on('open', (id) => {
                socket.emit('join-room', roomId, id, nameUser + "'s screen");
            });
            AddStream(screenStream, newPeer.id, nameUser + "'s screen");
            newPeer.on('call', call => {
                call.answer(screenStream)
            });
        } else {
            screenStream.getVideoTracks()[0].onended = false;
            setScreenStatus(!screenStatus);
            socket.emit('user-disconnect', screenPeer.id);
            RemoveStream(null);
            screenPeer.destroy();
        }

    }

    const handleSendMessage = () => {
        chatSocket.emit('message', nameUser, message, roomId);
        //setListMessages(list => [...list, nameUser + ": " + message])

    }

    const updateMessValue = (e) => {
        e.preventDefault()
        setMessage(e.target.value)
    }

    const AddStream =
        useCallback(
            (userVideoStream, peerId, userName) => setlistStream(list => {
                const newList = [...list, { peerId, videoStream: userVideoStream, userName }];
                const unique = [...new Map(newList.map(item => [item['peerId'], item])).values()];
                return (unique)
            }), []
        );


    const RemoveStream =
        useCallback(
            (peerId) => {
                setlistStream(list => list.filter(stream => stream.peerId !== peerId))
            }, []
        );

    const ListVideo = () => {
        const ShowListVideos = useMemo(() => {
            return listStream.map(
                (s, i) => <Video key={s.peerId} stream={s.videoStream} userName={s.userName} />
            )
        }, [listStream])
        return ShowListVideos;
    }

    const showListMessages = (list) => {
        return list.map(
            (e, i) => <ShowMessages key={i} message={e} />
        )
    }

    return (
        <div>
            <div>
                <button onClick={handleMuteButton}> {muteStatus} </button>
                <button onClick={handleHideCameraButton}> {cameraStatus} </button>
                <button onClick={handleShareScreen}> Share Screen </button>
            </div>

            <div id="video-grid">
                <div id="Div1">
                    <p>YOU ({nameUser})</p>
                    <video
                        ref={myVideo}
                        autoPlay
                    />
                </div>
                {ListVideo()}
            </div>
            <div id="message">
                <p>Chat:</p>
                <ul id="listMess">
                    {showListMessages(listMessages)}
                </ul>
                <input id="mess" onChange={(e) => updateMessValue(e)} />
                <button id="sendMess" onClick={handleSendMessage}>Send</button>
            </div>
        </div>
    );
}

export default Stream;