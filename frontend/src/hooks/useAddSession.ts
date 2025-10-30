import { useMutation } from "@tanstack/react-query";
import { adduserSessionData } from "../api/UserService";

const getDurationNumbers = (durationStr: string | null) => {
  if (!durationStr) return 0;

  const [mins, seconds] = durationStr
    .split(":")
    .map((num) => parseInt(num, 10));

  return mins * 60 + seconds;
};

export const useAddSession = ({
  userId,
  partnerId,
  startTimestamp,
  durationString,
  questionAttempted,
}: {
  userId: string;
  partnerId: string;
  startTimestamp: string;
  durationString: string;
  questionAttempted: any;
}) =>
  useMutation({
    mutationKey: ["addSessionData"],
    mutationFn: async () =>
      adduserSessionData({
        userId: userId,
        session: {
          peerUserId: partnerId,
          startTimestamp: startTimestamp
            ? new Date(parseInt(startTimestamp, 10))
            : new Date(),
          endTimestamp: new Date(),
          duration: getDurationNumbers(durationString),
          questionId: questionAttempted?.id || "",
          question: {
            title: questionAttempted?.title || "",
            difficulty: questionAttempted?.difficulty || "",
            topic:
              questionAttempted?.topic_tags
                ?.map(
                  // TODO: extract type to common type
                  (tag: { id: string; name: string; slug: string }) => tag.name,
                )
                .join(", ") || "",
          },
        },
      }),
    onSuccess: () => {
      console.log("User session data saved successfully.");
    },
  });
