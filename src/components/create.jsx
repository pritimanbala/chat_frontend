import {
  Box,
  Text,
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

const Create = () => {
  const [passworda, setPass] = useState("");
  const [passDiff, setPassDiff] = useState(true);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    room_code: "",
    password: "",
    confirmPassword: "",
    username: "",
  });

  const handleChange = (e) => {
    const newFormData = { ...formData, [e.target.name]: e.target.value };
    setFormData(newFormData);
    setPassDiff(newFormData.password !== newFormData.confirmPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { room_code, password, username } = formData;
      const payload = { room_code, password, username };
      console.log("here its okay");
      const res = await axios.post(
        "http://localhost:3000/api/create",
        payload,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      console.log(res.data);
      console.log(res.data.success);
      if (res.data.success) {
        navigate("/portal", {
          state: {
            room_code: formData.room_code,
            username: formData.username,
            messages: res.data.data.messages || [],
          },
        });
      }
    } catch (error) {
      console.log(error.message);
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
            <Fieldset.Legend width="100%">Create Room</Fieldset.Legend>
            <Fieldset.HelperText>
              Type the room code and password to access the room
            </Fieldset.HelperText>
            <Fieldset.Content>
              <Field.Root>
                <Field.Label>Room_Code</Field.Label>
                <Input
                  name="room_code"
                  placeholder="any 5 character code"
                  type="text"
                  value={formData.room_code}
                  onChange={handleChange}
                ></Input>
              </Field.Root>
              <Field.Root>
                <Field.Label>Password</Field.Label>
                <Input
                  name="password"
                  type="password"
                  placeholder="password"
                  value={formData.password}
                  onChange={handleChange}
                />
                <Field.Label>Confirm Password</Field.Label>
                <Input
                  name="confirmPassword"
                  type="password"
                  placeholder="confirm password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
              </Field.Root>
              <Field.Root>
                <Field.Label>Username</Field.Label>
                <Input
                  name="username"
                  type="text"
                  placeholder="username"
                  value={formData.username}
                  onChange={handleChange}
                ></Input>
              </Field.Root>
              {passDiff && <Text color="red">Password is not matching</Text>}
              <HStack>
                <Button type="submit" colorPalette="blue" disabled={passDiff}>
                  Create Room
                </Button>

                <Link href="/">
                  <Button colorPalette="blue">Find Room</Button>
                </Link>
              </HStack>
            </Fieldset.Content>
          </VStack>
        </Fieldset.Root>
      </form>
    </Box>
  );
};

export default Create;
