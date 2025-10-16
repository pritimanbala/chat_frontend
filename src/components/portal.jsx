import {
  Box,
  Textarea,
  Button,
  VStack,
  HStack,
  Heading,
  Link,
  Text,
  ButtonGroup,
} from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import socket from "@/socket";

const Portal = () => {
  const location = useLocation();
  let { room_code, username, password, messages } = location.state || {};
  const [allMessages, setAllMsg] = useState(messages || []);
  console.log(room_code, username, messages);
  const formData = { room_code, username, password };
  const [messageNew, setMessage] = useState({
    room_code,
    username,
    message: "",
  });

  const handleChange = (e) => {
    // console.log(messageNew);
    setMessage({
      ...messageNew,
      message: e.target.value,
    });
  };

  const fetchData = async () => {
    try {
      const res = await axios.get(
        "https://chatbackend-production-ed04.up.railway.app/api/login",
        {
          params: formData,
        }
      );
      if (res.data.data.messages.length > 0) {
        setAllMsg(res.data.data.messages);
      }
    } catch (error) {
      console.log("error", error.message);
    }
  };

  const handleSubmit = async (e) => {
    //prevent default
    e.preventDefault();
    try {
      const res = await axios.post(
        "https://chatbackend-production-ed04.up.railway.app/api/room",
        messageNew,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      setAllMsg(res.data.data.messages);
      socket.emit("send_message", { roomCode: room_code });
      fetchData();
      console.log("response", res.data);
    } catch (error) {
      console.log("error in sending message", error.message);
    }
  };

  //direct useage of socket here
  useEffect(() => {
    socket.connect();
    socket.emit("join_room", room_code);

    socket.on("receive_message", () => {
      fetchData();
    });
    return () => {
      socket.off("receive_message");
      socket.disconnect();
    };
  }, [room_code]);
  return (
    <>
      <div
        style={{
          height: "100vh",
          width: "100%",
          backgroundColor: "black",
          color: "white",
          // paddingY: "15px",
        }}
      >
        <form onSubmit={handleSubmit}>
          <Box
            color="white"
            border="2px solid white"
            bg="black"
            // position="absolute"
            paddingY="6"
            marginBottom={2}
          >
            <HStack justify="space-between" marginX={10}>
              <Box>
                <Heading>Room {room_code}</Heading>
                <Heading>{username}</Heading>
              </Box>

              <Link href="/">
                <Button variant="outline">Leave Room</Button>
              </Link>
            </HStack>
          </Box>

          {/* message area */}
          <VStack
            overflowY="auto"
            height="80vh"
            align="stretch" //this align stretch helps us to send the items to the corner
            marginX={5}
            spacing={3}
          >
            {allMessages && allMessages.length > 0
              ? allMessages.map((msg, index) => {
                  return (
                    <HStack
                      key={index}
                      justify={
                        msg.username === username ? "flex-end" : "flex-start"
                      }
                    >
                      <Box
                        bg="gray.800"
                        p="2rem 4rem"
                        borderRadius="lg"
                        maxW="70%"
                      >
                        <VStack align="flex-start">
                          <Heading size="sm">{msg.username}</Heading>
                          <Text>{msg.message}</Text>
                        </VStack>
                      </Box>
                    </HStack>
                  );
                })
              : null}
          </VStack>

          <Box position="absolute" bottom="0" left="0" width="100%">
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-around"
            >
              <Textarea
                placeholder="message"
                width="80%"
                value={messageNew.message}
                onChange={handleChange}
              ></Textarea>
              <Button variant="subtle" type="submit">
                Send
              </Button>
            </Box>
          </Box>
        </form>
      </div>
    </>
  );
};

export default Portal;
