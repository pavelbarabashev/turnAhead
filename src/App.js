import React, { useRef, useState, useEffect } from "react";

// import logo from './logo.svg';
import * as tf from "@tensorflow/tfjs";
import * as handpose from "@tensorflow-models/handpose";
import Webcam from "react-webcam";
import "./App.css";
import { drawHand } from "./utilities";
import * as fp from "fingerpose";
import { HeadRotation } from "./components/HeadRotation";


///////// PNG Imports
import open_hand from "./png/open_hand.png";
import victory from "./png/victory.png";
import fist from "./png/fist.png";
///////// Gesture Imports
import {
  OpenHandGesture,
  VictoryGesture,
  RadGesture,
  ThumbsUpGesture,
  FistGesture,
} from "./Gestures";
import './styles/index.scss'

import { HandDetector } from "@tensorflow-models/handpose/dist/hand";
import { div } from "@tensorflow/tfjs";

function App() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);

  ///////// NEW STUFF ADDED STATE HOOK
  const [verificationEmoji, setVerificationEmoji] = useState("")
  const [emoji, setEmoji] = useState(null);
  let initialGestureArray = []
  for (let i=0;i<10;i++){
    initialGestureArray.push("")
  }
  const [gestureQueue, setGestures] = useState(initialGestureArray)

  const images = {
    open_hand: open_hand,
    victory: victory,
    fist: fist,
  };

  function randomGesture() {
  const keys = Object.keys(images);
  return keys[Math.floor(Math.random() * keys.length)];
  }

  useEffect(()=>{setVerificationEmoji(randomGesture())},[])
  



  const runHandpose = async () => {
    console.log("Loading handpose model...");
    const handposeModel = await handpose.load();
    console.log("Handpose model loaded.");
    //  Loop and detect hands
    setInterval(() => {
      detect(handposeModel);
  }, 10);
  };

  const detect = async (handposeModel) => {
  
    if (
      typeof webcamRef.current !== "undefined" &&
      webcamRef.current !== null &&
      webcamRef.current.video.readyState === 4
    ) {
      // Get Video Properties
      const video = webcamRef.current.video;
      const videoWidth = webcamRef.current.video.videoWidth;
      const videoHeight = webcamRef.current.video.videoHeight;

      // Set video width
      webcamRef.current.video.width = videoWidth;
      webcamRef.current.video.height = videoHeight;

      // Set canvas height and width
      canvasRef.current.width = videoWidth;
      canvasRef.current.height = videoHeight;

      // Make Detections
      // 2nd argument false: flipHorizontal
      const hand = await handposeModel.estimateHands(video, false);
      // console.log(hand);

      ///////// NEW STUFF ADDED GESTURE HANDLING

      if (hand.length > 0) {
        // GE: Gesture Estimator
        const GE = new fp.GestureEstimator([
          OpenHandGesture,
          VictoryGesture,
          RadGesture,
          ThumbsUpGesture,
          FistGesture,
        ]);

        // 2nd arg is the minimum score it's looking for
        const gesture = await GE.estimate(hand[0].landmarks, 10);
        console.log(gesture)
        if (gesture.gestures === undefined) {
          console.log("no hand");
          setEmoji("");
          // setGestureDuration(0);
          setGestures((gestureQueue)=>{
            let prevGestures = gestureQueue.slice(1)
            prevGestures.push("")
            return(prevGestures)})
        } else if (gesture.gestures.length > 0) {

          const confidence = gesture.gestures.map(
            (prediction) => prediction.confidence
          );
          const maxConfidence = confidence.indexOf(
            Math.max.apply(null, confidence)
          );

          // MOST LIKELY CURRENT GESTURE IS gesture.gestures[maxConfidence].name
          // Ideally our gesturesQueue would update the end with this...and remove the 0 index.... but it doesn't for some reason.
          
          // let prevGestures = gestureQueue.slice(1);
          // prevGestures.push(gesture.gestures[maxConfidence].name)
          
          setGestures((gestureQueue)=>{
            let prevGestures = gestureQueue.slice(1)
            prevGestures.push(gesture.gestures[maxConfidence].name)
          console.log(gestureQueue)
            return(prevGestures)})

          setEmoji(gesture.gestures[maxConfidence].name);

         
        }
      }else{
        setEmoji("")
        setGestures((gestureQueue)=>{
          let prevGestures = gestureQueue.slice(1)
          prevGestures.push("")
          return(prevGestures)})
      }
      ///////// NEW STUFF ADDED GESTURE HANDLING

 
    }
  };

  useEffect(() => {
    runHandpose();
  },[]);

  
 
  return (
    <div className="App">
      { !emoji &&
      <header className="App-header">
        <div>Show the current gesture: <img src={images[verificationEmoji]}></img></div>
        <Webcam
          ref={webcamRef}
          id="webcam"
          mirrored={true}
        />

        <canvas
          ref={canvasRef}
        />
        
      </header>
} {emoji === verificationEmoji && <div id="img-view">
          <HeadRotation></HeadRotation>
         </div>}
    </div>
  );
}

export default App;
