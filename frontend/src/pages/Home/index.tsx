import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Bolt, BookOpen, Clock, Trophy, Users } from "lucide-react";
import { Controller, type SubmitHandler, useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import z from "zod";
import { SubmitButton } from "../../components/SubmitButton";
import { useAuth } from "../../context/AuthContext";
import { Card } from "./Components/Card";
import { MainCard } from "./Components/MainCard";
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
  const navigate = useNavigate();
  const { handleSubmit, control, watch } = useForm({
    resolver: zodResolver(preferenceFormSchema),
  });

  const difficulty = watch("difficulty");
  const topic = watch("topic");

  const onSubmit: SubmitHandler<preferenceForm> = (_data) => {
    if (!user || !user.id) {
      return;
    }
    const matchingParams = {
      userId: user.id,
      difficulty: _data.difficulty.name,
      topics: [_data.topic.name],
    };
    sessionStorage.setItem("matchingParams", JSON.stringify(matchingParams));
    navigate("/matching", { state: matchingParams });
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
              title="12"
              description="Sessions Completed"
              icon={<Trophy />}
            />
            <StatsCard
              title="8.5"
              description="Hours Practiced"
              icon={<Clock />}
            />
            <StatsCard title="24" description="Peers Met" icon={<Users />} />
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
                <Card>
                  <h2 className="font-bold">Recent Sessions</h2>
                  <p className="text-sm text-gray-500">
                    You do not have any recent sessions.
                  </p>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};

export default Home;
