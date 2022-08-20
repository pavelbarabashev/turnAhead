
import React, {useEffect, useState} from "react";
import Webcam from "react-webcam";
import { Timer } from "./Timer";
import axios from "axios"

export const HeadRotation = () => {
    const webcamRef = React.useRef(null);
    const mediaRecorderRef = React.useRef(null);
    const [capturing, setCapturing] = React.useState(false);
    const [recordedChunks, setRecordedChunks] = React.useState([]);
    const isInitialMount = React.useRef(true);
    const [isTimerVisible, setIsTimerVisible] = useState(false)
    

    useEffect(() => {
      if (isInitialMount.current) {
        isInitialMount.current = false;
      } else {
        if (!capturing) {
          console.log('running handleDownload')
          handleDownload();
        }
      }
    }, [capturing])

    const handleDownload = React.useCallback(() => {
        if (recordedChunks.length) {
          const blob = new Blob(recordedChunks, {
            type: "video/webm"
          });
          const url = URL.createObjectURL(blob);
          const video = document.getElementById("video-replay");
          axios.post("http://localhost:8000/api/v1/video", {blob}).then((response)=>{
            console.log(response)
          }).catch((error)=>{console.log(error)})
          
          video.src = url
        }
      }, [recordedChunks]);
    const handleStopCaptureClick = React.useCallback(() => {
        mediaRecorderRef.current.stop();
        setCapturing(false);
        handleDownload()
      }, [mediaRecorderRef, webcamRef, setCapturing]);
  

    const handleStartCaptureClick = React.useCallback(() => {
      setCapturing(true);
      setIsTimerVisible(false)
      mediaRecorderRef.current = new MediaRecorder(webcamRef.current.stream, {
        mimeType: "video/webm"
      });
      mediaRecorderRef.current.addEventListener(
        "dataavailable",
        handleDataAvailable
      );
      mediaRecorderRef.current.start();
      setTimeout(handleStopCaptureClick, 5000)  
      
    }, [webcamRef, setCapturing, mediaRecorderRef]);
  
 
  
    const handleDataAvailable = React.useCallback(
      ({ data }) => {
        if (data.size > 0) {
          setRecordedChunks((prev) => prev.concat(data));
        }
      },
      [setRecordedChunks]
    );
  

       
  
    return (
      <div className="container-for-vid">
        <Webcam audio={false} ref={webcamRef} height={400} width={500}/>
        <video id="video-replay" height="400" width="500" controls></video>
        {!capturing && <button className="btn btn-danger" onClick={()=>{ setIsTimerVisible(true);
            setTimeout(handleStartCaptureClick, 3000);}}>Start Capture</button>}
            {capturing&& <p id="recording">Recording...</p>}
        {isTimerVisible=== true && <Timer setIsTimerVisible={setIsTimerVisible}></Timer>}
        {recordedChunks.length > 0 && (
          <div>
            <button onClick={handleDownload}>Send</button>
          </div>
        )}
      </div>
    );
};