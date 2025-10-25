import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Bolt, BookOpen, Clock, Trophy, Users } from "lucide-react";
import { Controller, type SubmitHandler, useForm } from "react-hook-form";
import z from "zod";
import { userStatistics } from "../../api/UserService";
import { SubmitButton } from "../../components/SubmitButton";
import { useAuth } from "../../context/AuthContext";
import { Card } from "./Components/Card";
import { MainCard } from "./Components/MainCard";
import { RecentSessions } from "./Components/RecentSessions";
import {
  type DifficultyItem,
  SelectDifficulty,
} from "./Components/SelectDifficulty";
import { SelectTopic, type TopicItem } from "./Components/SelectTopic";
import { StatsCard } from "./Components/StatsCard";

const preferenceFormSchema = z.object({
  difficulty: z.custom<DifficultyItem>(),
  topic: z.custom<TopicItem>(),
});

type preferenceForm = z.infer<typeof preferenceFormSchema>;

const Home = () => {
  const { user } = useAuth();
  const { handleSubmit, control, watch } = useForm({
    resolver: zodResolver(preferenceFormSchema),
  });

  const { data: sessionStatistics } = useQuery({
    queryKey: ["sessionStatistics", user?.id],
    // @ts-expect-error We check that user id is available in enabled
    queryFn: () => userStatistics({ userId: user.id }),
    enabled: !!user,
  });

  const difficulty = watch("difficulty");
  const topic = watch("topic");

  const onSubmit: SubmitHandler<preferenceForm> = (_data) => {
    // TODO: navigate to matching page with these parameters
  };

  if (!user) {
    return null;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="min-h-screen max-w-screen flex flex-col gap-7 bg-gray-50 p-10">
        <div>
          <h1 className="text-black font-bold text-3xl">
            Welcome back, {user.name}!
          </h1>
          <span className="text-gray-500">
            Ready to practice some coding interviews?
          </span>
        </div>
        <div className="flex flex-col gap-5">
          <div className="flex flex-row gap-3 flex-wrap">
            <StatsCard
              title={sessionStatistics?.data.totalSessions || 0}
              description="Sessions Completed"
              icon={<Trophy />}
            />
            <StatsCard
              title={sessionStatistics?.data.hoursPracticed || 0}
              description="Hours Practiced"
              icon={<Clock />}
            />
            <StatsCard
              title={sessionStatistics?.data.peersMet || 0}
              description="Peers Met"
              icon={<Users />}
            />
          </div>
          <div className="flex flex-row gap-3 flex-wrap">
            <div className="flex flex-col flex-2 gap-4">
              <MainCard
                title="Choose your topic"
                description="Select the area you want to practice today"
                icon={<BookOpen className="text-blue-400" />}
              >
                <Controller
                  control={control}
                  name="topic"
                  render={({ field: { onChange, value } }) => (
                    <SelectTopic onChange={onChange} value={value} />
                  )}
                />
              </MainCard>
              <MainCard
                title="Choose difficulty"
                description="Pick the challenge level that matches your skill"
                icon={<Bolt className="text-blue-400" />}
              >
                <Controller
                  control={control}
                  name="difficulty"
                  render={({ field: { onChange, value } }) => (
                    <SelectDifficulty onChange={onChange} value={value} />
                  )}
                />
              </MainCard>
              <SubmitButton disabled={!difficulty || !topic}>
                <div className="flex flex-row items-center justify-center gap-2">
                  Find a Practice Partner <ArrowRight />
                </div>
              </SubmitButton>
            </div>
            <div className="lg:flex-1 md:flex-0">
              <div className="flex flex-col gap-2">
                <Card>
                  <div className="flex flex-row items-center gap-2">
                    <Users />
                    <h2 className="font-bold">Active Now</h2>
                  </div>
                  <div className="flex flex-row items-center gap-2">
                    {/* credits https://www.sanyam.xyz/blogs/creating-blinking-dot-effect-using-tailwind */}
                    <div className="relative inline-flex">
                      <div className="rounded-full bg-green-400 h-[8px] w-[8px] inline-block mr-2"></div>
                      <div className="absolute animate-ping rounded-full bg-green-400 h-[8px] w-[8px] mr-2"></div>
                    </div>
                    <p className="font-semibold text-sm">247 Students online</p>
                  </div>
                  <p className="text-sm text-gray-500">
                    Average wait time: ~30 seconds
                  </p>
                </Card>
                <RecentSessions
                  sessions={sessionStatistics?.data.sessions || []}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};

export default Home;
