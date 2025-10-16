import {
  Box,
  Heading,
  Fieldset,
  Field,
  Input,
  VStack,
  Button,
  Link,
  HStack,
} from "@chakra-ui/react";
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ssrModuleExportsKey } from "vite/module-runner";

const Login = () => {
  const [formData, setFormData] = useState({
    room_code: "",
    password: "",
    username: "",
  });
  const [resData, setResData] = useState(null);
  const [redir, setRedir] = useState(false);
  const navigate = useNavigate();

  //filing the data in object format in formData
  const handleData = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    try {
      //do prevent default
      e.preventDefault();
      //then send a get request to send your data to the server
      const res = await axios.get(
        "https://chatbackend-production-ed04.up.railway.app/api/login",
        {
          params: formData,
        }
      );
      console.log(res.data);
      console.log(res.data.success);
      // then take the response object and then check the status
      if (res.data.success === true) {
        console.log("sucessfully entered the room");
        setResData(res.data);
        setRedir(true);
        navigate("/portal", {
          state: {
            room_code: formData.room_code,
            username: formData.username,
            password: formData.password,
            messages: res.data.data.messages,
          },
        });
      } else {
        console.log("some error has occured");
      }

      //check if any error is there or not
    } catch (error) {
      console.log("some error has occured", error.message);
    }
  };

  return (
    <Box
      position="absolute"
      top="50%"
      left="50%"
      transform="translate(-50%,-50%)"
      border="2px solid white"
      // backgroundColor="white"
      height="fit-content"
      width="90%"
      padding="2rem 5rem"
      // height="100vh"
    >
      <form onSubmit={handleSubmit}>
        <Fieldset.Root>
          <VStack>
            <Fieldset.Legend width="100%">Join Room</Fieldset.Legend>
            <Fieldset.HelperText>
              Type the room code and password to access the room
            </Fieldset.HelperText>
            <Fieldset.Content>
              <Field.Root>
                <Field.Label>Room_Code</Field.Label>
                <Input
                  name="room_code"
                  placeholder="room code"
                  type="text"
                  value={formData.room_code}
                  onChange={handleData}
                ></Input>
              </Field.Root>
              <Field.Root>
                <Field.Label>Password</Field.Label>
                <Input
                  name="password"
                  type="password"
                  placeholder="password"
                  value={formData.password}
                  onChange={handleData}
                ></Input>
              </Field.Root>
              <Field.Root>
                <Field.Label>username</Field.Label>
                <Input
                  name="username"
                  type="text"
                  placeholder="username"
                  value={formData.username}
                  onChange={handleData}
                ></Input>
              </Field.Root>
              <HStack>
                <Button type="submit" colorPalette="blue">
                  Find Room
                </Button>
                <Button colorPalette="blue">
                  <Link href="/create">Create Room</Link>
                </Button>
              </HStack>
            </Fieldset.Content>
          </VStack>
        </Fieldset.Root>
      </form>
    </Box>
  );
};

export default Login;
