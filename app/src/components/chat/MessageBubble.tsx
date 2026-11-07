import React, { useState, useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { Text } from "../ui/Text.js";
import { colors } from "../../theme/colors.js";
import { spacing, radius } from "../../theme/spacing.js";
import { MessageItem } from "../../api/chat.js";
import { SolMascot } from "../Sol/SolMascot.js";
import { SupportCard } from "./SupportCard.js";
import { ActivityCard } from "./ActivityCard.js";

interface MessageBubbleProps {
  message: MessageItem;
  isNewest?: boolean;
}

export function MessageBubble({ message, isNewest }: MessageBubbleProps): React.JSX.Element {
  const isUser = (message.role || message.sender) === "user";
  const shouldAnimate = !isUser && isNewest;
  const [displayedText, setDisplayedText] = useState(shouldAnimate ? "" : message.content);

  useEffect(() => {
    if (!shouldAnimate) {
      setDisplayedText(message.content);
      return;
    }

    let currentIndex = 0;
    const fullText = message.content;
    const interval = setInterval(() => {
      currentIndex += 2;
      if (currentIndex >= fullText.length) {
        setDisplayedText(fullText);
        clearInterval(interval);
      } else {
        setDisplayedText(fullText.slice(0, currentIndex));
      }
    }, 25);

    return () => clearInterval(interval);
  }, [shouldAnimate, message.content]);

  return (
    <View style={[styles.container, isUser ? styles.userContainer : styles.assistantContainer]}>
      {!isUser ? (
        <View style={styles.avatarContainer}>
          <SolMascot size={30} expression={message.flagged ? "concerned" : "calm"} />
        </View>
      ) : null}

      <View style={[styles.bubbleWrapper, isUser ? styles.userWrapper : styles.assistantWrapper]}>
        <View style={[styles.bubble, isUser ? styles.userBubble : styles.assistantBubble]}>
          <Text
            variant="body"
            color={isUser ? colors.surface : colors.ink}
            style={styles.text}
          >
            {displayedText}
          </Text>
        </View>

        {message.flagged === "crisis" ? <SupportCard /> : null}

        {message.suggestion ? <ActivityCard suggestion={message.suggestion} /> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    marginVertical: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  userContainer: {
    justifyContent: "flex-end",
  },
  assistantContainer: {
    justifyContent: "flex-start",
    alignItems: "flex-start",
  },
  avatarContainer: {
    marginRight: spacing.sm,
    marginTop: 4,
  },
  bubbleWrapper: {
    maxWidth: "82%",
  },
  userWrapper: {
    alignItems: "flex-end",
  },
  assistantWrapper: {
    alignItems: "flex-start",
  },
  bubble: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.card,
  },
  userBubble: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.primarySoft,
    borderBottomLeftRadius: 4,
  },
  text: {
    lineHeight: 22,
  },
});
