"use client";

import React, { useState } from "react";
import PageHeader from "../components/PageHeader";
import PromptBox from "../components/PromptBox";
import Title from "../components/Title";
import TwoColumnLayout from "../components/TwoColumnLayout";
import ResultWithSources from "../components/ResultWithSources";
import ButtonContainer from "../components/ButtonContainer";
import Button from "../components/Button";
import {useRef } from "react";

const endpoint = "/api/resume-query-metadata";

const ResumeReader = () => {
  const [prompt, setPrompt] = useState("");
  const [error, setError] = useState(null);

  const [messages, setMessages] = useState([
    {
      text: "Ex. Has anyone worked at meta?",
      type: "bot",
    },
  ]);

  const handlePromptChange = (e) => {
    setPrompt(e.target.value);
  };
  const handleSubmitUpload = async () => {
    try {
      // Push the response into the messages array
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          text: "Uploading resumes...",
          type: "bot",
        },
      ]);

      const response = await fetch(`/api/resume-upload`);
      const transcriptRes = await response.json();

      if (!response.ok) {
        throw new Error(transcriptRes.error);
      }

      console.log({ transcriptRes });

      // assuming transcriptRes is an object
      const summariesArray = JSON.parse(transcriptRes.output);

      const newMessages = summariesArray.map((summary) => ({
        text: summary.summary,
        type: "bot",
      }));

      setMessages((prevMessages) => [...prevMessages, ...newMessages]);

      setPrompt("");
    } catch (err) {
      console.error(err);
      setError("Error");
    }
  };

  const handleSubmit = async () => {
    try {
      // Push the user's message into the messages array
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: prompt, type: "user", sourceDocuments: null },
      ]);

      // set loading message
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: "...", type: "bot", sourceDocuments: null },
      ]);

      const response = await fetch(`${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });

      const searchRes = await response.json();
      console.log({ searchRes });

      // remove loading message
      setMessages((prevMessages) => prevMessages.slice(0, -1));

      // Push the response into the messages array
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          text: searchRes.output,
          type: "bot",
          sourceDocuments: searchRes.sourceDocuments,
        },
      ]);
      setPrompt("");
    } catch (err) {
      console.error(err);
      setError(err);
    }
  };

  
  const [pictureFiles, setPictureFiles] = useState([]);

  const pictureChangeHandler = event => {
      const files = Array.from(event.target.files);
      setPictureFiles(files);
  };
  
  const uploadPictureHandler = async () => {
      const pictureData = new FormData();
      pictureFiles.forEach((file, index) => {
          pictureData.append(`pdf${index}`, file);
      });
  
      try {
          const response = await fetch('/api/file-upload', {
              method: 'POST',
              body: pictureData,
          });
          const data = await response.json();
          if (!response.ok) {
              throw data;
          }
          setPictureFiles([]);
      } catch (error) {
          console.log(error.message);
      }
  };

  const uploadFunctionalityHandler = async () => {
    await uploadPictureHandler();
    await handleSubmitUpload();
  }


  return (
    <>
      <>
        <Title emoji="🤖" headingText="RoboHR" />
        <div className="w-full" >
          <ButtonContainer>
                  <Button
                    handleSubmit={handleSubmitUpload}
                    endpoint=""
                    buttonText=" Upload Resumes 📂"
                  />
          </ButtonContainer>

          <div className="input-group input-group-sm mb-3">
            <input accept=".pdf" type="file" className="form-control" name='picture' multiple onChange={pictureChangeHandler} />            
            <button className={`btn btn-primary btn-sm px-3`} onClick={uploadFunctionalityHandler}>
                submit
            </button>
          </div>



          <ResultWithSources messages={messages} pngFile="robohr" />

          <PromptBox
            prompt={prompt}
            handlePromptChange={handlePromptChange}
            handleSubmit={handleSubmit}
            error={error}
            placeHolderText={"Enter Prompt"}
          />
        </div>
        

      </>
    </>
  );
};

export default ResumeReader;
