import {
  Box,
  Textarea,
  Button,
  VStack,
  HStack,
  Link,
  Text,
} from "@chakra-ui/react";
import React, { useEffect, useState, useRef, useCallback } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import socket from "@/socket";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600&family=DM+Sans:wght@400;500;600&display=swap');
  * { box-sizing: border-box; }
  body { margin: 0; background: #080808; }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: #333; border-radius: 2px; }
  @keyframes msgIn {
    from { opacity: 0; transform: translateY(10px) scale(0.97); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }
  .msg-bubble { animation: msgIn 0.22s cubic-bezier(0.34, 1.56, 0.64, 1) both; }
  .send-btn { transition: background 0.2s, transform 0.1s; }
  .send-btn:hover  { background: #e0e0e0 !important; transform: scale(1.03); }
  .send-btn:active { transform: scale(0.97); }
  .leave-btn { transition: background 0.2s, color 0.2s; }
  .leave-btn:hover { background: #ff4444 !important; border-color: #ff4444 !important; color: #fff !important; }
  textarea:focus { outline: none !important; box-shadow: none !important; }
  .textarea-wrap:focus-within { border-color: #555 !important; }
`;

const Portal = () => {
  const location = useLocation();
  const { room_code, username, password, messages } = location.state || {};

  const [allMessages, setAllMsg] = useState(messages || []);
  const [messageNew, setMessage] = useState({ room_code, username, message: "" });

  const bottomRef = useRef(null);
  // Store credentials in a ref so fetchData never becomes stale
  const formData = useRef({ room_code, username, password });

  const scrollToBottom = (behavior = "smooth") => {
    bottomRef.current?.scrollIntoView({ behavior });
  };

  useEffect(() => {
    scrollToBottom();
  }, [allMessages]);

  // Stable function — won't change between renders, safe to use in socket listener
  const fetchData = useCallback(async () => {
    try {
      const res = await axios.get("http://localhost:3001/api/login", {
        params: formData.current,
      });
      if (res.data.data.messages.length > 0) {
        setAllMsg(res.data.data.messages);
      }
    } catch (error) {
      console.log("error fetching messages:", error.message);
    }
  }, []);

  useEffect(() => {
    // Connect only if not already connected — prevents duplicate connections on re-renders
    if (!socket.connected) {
      socket.connect();
    }

    socket.emit("join_room", room_code);

    // Remove any stale listener before adding a fresh one
    socket.off("receive_message");

    // This fires for EVERY user in the room when anyone sends a message
    socket.on("receive_message", () => {
      fetchData();
    });

    // KEY FIX: only remove the listener on cleanup, never disconnect.
    // The old code called socket.disconnect() here which killed B's connection
    // on any re-render, making them miss incoming messages entirely.
    return () => {
      socket.off("receive_message");
    };
  }, [room_code, fetchData]);

  const handleChange = (e) => {
    setMessage((prev) => ({ ...prev, message: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!messageNew.message.trim()) return;
    try {
      const res = await axios.post(
        "http://localhost:3001/api/room",
        messageNew,
        { headers: { "Content-Type": "application/json" } }
      );
      setAllMsg(res.data.data.messages);
      socket.emit("send_message", { roomCode: room_code });
      setMessage((prev) => ({ ...prev, message: "" }));
    } catch (error) {
      console.log("error sending message:", error.message);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const isMine = (msg) => msg.username === username;

  const formatTime = (ts) => {
    if (!ts) return "";
    const d = new Date(ts);
    return isNaN(d) ? "" : d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <>
      <style>{styles}</style>
      <Box
        height="100vh"
        width="100%"
        bg="#080808"
        color="white"
        display="flex"
        flexDirection="column"
        fontFamily="'DM Sans', sans-serif"
        overflow="hidden"
      >
        {/* HEADER */}
        <Box
          borderBottom="1px solid #1e1e1e"
          bg="rgba(10,10,10,0.95)"
          backdropFilter="blur(12px)"
          px={6}
          py={4}
          flexShrink={0}
        >
          <HStack justify="space-between" align="center">
            <HStack spacing={4} align="center">
              <Box bg="#111" border="1px solid #2a2a2a" borderRadius="8px" px={3} py={1}>
                <Text fontFamily="'IBM Plex Mono', monospace" fontSize="11px" color="#666" letterSpacing="0.12em" textTransform="uppercase">Room</Text>
                <Text fontFamily="'IBM Plex Mono', monospace" fontSize="18px" fontWeight="600" color="#fff" lineHeight="1.2" letterSpacing="0.05em">{room_code}</Text>
              </Box>
              <Box height="36px" width="1px" bg="#222" />
              <HStack spacing={2}>
                <Box width="32px" height="32px" borderRadius="50%" bg="#1a1a1a" border="1px solid #2e2e2e" display="flex" alignItems="center" justifyContent="center">
                  <Text fontSize="13px" fontWeight="600" color="#aaa">{username?.[0]?.toUpperCase()}</Text>
                </Box>
                <Text fontSize="14px" fontWeight="500" color="#ccc">{username}</Text>
              </HStack>
            </HStack>
            <Link href="/" _hover={{ textDecoration: "none" }}>
              <Button className="leave-btn" size="sm" variant="outline" borderColor="#2e2e2e" color="#999" bg="transparent" fontFamily="'IBM Plex Mono', monospace" fontSize="12px" letterSpacing="0.05em" px={4}>
                Leave Room
              </Button>
            </Link>
          </HStack>
        </Box>

        {/* MESSAGES */}
        <Box flex="1" overflowY="auto" px={5} py={4}>
          <VStack align="stretch" spacing={2}>
            {allMessages && allMessages.length > 0 ? (
              allMessages.map((msg, index) => {
                const mine = isMine(msg);
                const prevSame = index > 0 && allMessages[index - 1].username === msg.username;
                return (
                  <Box key={index} className="msg-bubble" display="flex" justifyContent={mine ? "flex-end" : "flex-start"} mt={prevSame ? "2px" : "10px"}>
                    {!mine && (
                      <Box width="28px" height="28px" borderRadius="50%" bg="#1a1a1a" border="1px solid #2a2a2a" display="flex" alignItems="center" justifyContent="center" flexShrink={0} mr={2} mt="auto" opacity={prevSame ? 0 : 1}>
                        <Text fontSize="11px" fontWeight="600" color="#777">{msg.username?.[0]?.toUpperCase()}</Text>
                      </Box>
                    )}
                    <Box maxW="62%">
                      {!mine && !prevSame && (
                        <Text fontFamily="'IBM Plex Mono', monospace" fontSize="10px" color="#555" letterSpacing="0.08em" mb="4px" ml="2px" textTransform="uppercase">{msg.username}</Text>
                      )}
                      <Box
                        bg={mine ? "#f5f5f5" : "#131313"}
                        color={mine ? "#0a0a0a" : "#e5e5e5"}
                        border={mine ? "none" : "1px solid #1e1e1e"}
                        borderRadius={mine ? (prevSame ? "16px 4px 4px 16px" : "16px 4px 16px 16px") : (prevSame ? "4px 16px 16px 4px" : "4px 16px 16px 16px")}
                        px={4} py={3}
                      >
                        <Text fontSize="14px" lineHeight="1.55" fontWeight={mine ? "500" : "400"} whiteSpace="pre-wrap" wordBreak="break-word">{msg.message}</Text>
                        {msg.timestamp && (
                          <Text fontFamily="'IBM Plex Mono', monospace" fontSize="9px" color={mine ? "#888" : "#3a3a3a"} mt="4px" textAlign="right" letterSpacing="0.04em">{formatTime(msg.timestamp)}</Text>
                        )}
                      </Box>
                    </Box>
                  </Box>
                );
              })
            ) : (
              <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="40vh" opacity={0.3}>
                <Text fontFamily="'IBM Plex Mono', monospace" fontSize="28px" color="#333" mb={2}>◌</Text>
                <Text fontFamily="'IBM Plex Mono', monospace" fontSize="11px" color="#444" letterSpacing="0.12em" textTransform="uppercase">No messages yet</Text>
              </Box>
            )}
            <div ref={bottomRef} />
          </VStack>
        </Box>

        {/* INPUT */}
        <Box borderTop="1px solid #1a1a1a" bg="rgba(8,8,8,0.98)" px={5} py={4} flexShrink={0}>
          <form onSubmit={handleSubmit}>
            <HStack spacing={3} align="flex-end">
              <Box className="textarea-wrap" flex="1" bg="#0f0f0f" border="1px solid #2a2a2a" borderRadius="14px" px={4} py="10px" transition="border-color 0.2s">
                <Textarea
                  placeholder="Type a message… (Enter to send)"
                  value={messageNew.message}
                  onChange={handleChange}
                  onKeyDown={handleKeyDown}
                  border="none"
                  bg="transparent"
                  color="#e5e5e5"
                  fontFamily="'DM Sans', sans-serif"
                  fontSize="14px"
                  resize="none"
                  minH="20px"
                  maxH="120px"
                  p={0}
                  _placeholder={{ color: "#3a3a3a" }}
                  rows={1}
                  overflow="auto"
                />
              </Box>
              <Button
                className="send-btn"
                type="submit"
                bg="#f0f0f0"
                color="#080808"
                fontFamily="'IBM Plex Mono', monospace"
                fontSize="12px"
                fontWeight="600"
                letterSpacing="0.06em"
                borderRadius="12px"
                px={5}
                py={6}
                flexShrink={0}
                isDisabled={!messageNew.message.trim()}
                _disabled={{ opacity: 0.3, cursor: "not-allowed" }}
              >
                Send ↑
              </Button>
            </HStack>
          </form>
        </Box>
      </Box>
    </>
  );
};

export default Portal;