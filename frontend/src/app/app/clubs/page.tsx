"use client";

import React, { useEffect, useState } from "react";
import { Card } from "@/app/components/ui/Card";
import { Badge } from "@/app/components/ui/Badge";
import { Sparkles, Users, Info, CalendarDays, MapPin, Link2 } from "lucide-react";
import Image from "next/image";
import { fetchEvents } from "@/lib/studentHubApi";

const clubs = [
  {
    name: "Rotaract Club 🤝",
    image: "https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&q=80&w=800",
    description: "The club is based on philanthropic values and objectives and aims at bringing together young adults for the benefit and welfare of society. Frontliners aged 18 and older get a chance to trade schemes with headmen in the community and flourish initiatives and professional skills, all while serving the community. Working under the Rotary Club of Meenambakkam, young pioneers of the club make it their mission to achieve sustainable development goals for making lasting positive changes in the world."
  },
  {
    name: "Astrophilia 🌌",
    image: "https://images.unsplash.com/photo-1464802686167-b939a67e06a1?auto=format&fit=crop&q=80&w=800",
    description: "This is a club devoted to studying stars, constellations, planets, galaxies, and all other things which twinkle in the sky. It is where students can learn and spread awareness about space and astronomy through dedicated scientific and philosophical discussions and interactions. It allows amateur astronomers and physics enthusiasts to get to know more about the vast and enigmatic universe and carry forward the legacy of the cosmos."
  },
  {
    name: "Fashion 👠",
    image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&q=80&w=800",
    description: "The club provides a place for students to express their inherent artistic flair in the fashion world. They set trends and break them too, thus, genuinely pioneering the meaning of beauty and redefining it. It is here, that students can learn to groom themselves and carry themselves perfectly down a narrow runway, right into the grandiose and glamorous world of fashion."
  },
  {
    name: "Music 🎵",
    image: "https://images.unsplash.com/photo-1459749411177-042180ce673c?auto=format&fit=crop&q=80&w=800",
    description: "The club is where students with musical inclinations can come together to display and sharpen their harmonious talents. It helps students to assemble their knowledge of music to create a harmonious crescendo. Being a part of this club is a wonderful opportunity to meet people with varied tastes in music, equally passionate about music, and people who may give you a new perspective on the way you look at the world of symphony."
  },
  {
    name: "Literature Club 📚",
    image: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&q=80&w=800",
    description: "\"The pen is mightier than the sword.\" While thought exists, words are alive and literature becomes an escape, not from, but into the living. The club is a utopia for thinkers, readers, and writers; it is where literary minds come together for scholarly brainstorming sessions and discussions; it showers the enchantment of poems, stories, and essays in young minds, thus, giving life to their words, thoughts, and imagination."
  },
  {
    name: "Festival 🎨",
    image: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&q=80&w=800",
    description: "The true beauty of culture can be observed in the way we rejoice in them. The club aims in making each festival a noteworthy experience. The club celebrates and memorialises the diversity in the different cultures of the country. It helps students seek cultural enrichment, education, novelty, and socialisation by witnessing and celebrating various festivals belonging to multiple cultures and religions."
  },
  {
    name: "Dance Club 💃",
    image: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&q=80&w=800",
    description: "The club is the combination of many dynamic and talented professionals from different genres of practice, where they can nurture their talent, celebrate their diversity, and express the creative fluidity of young minds. The club makes the students adapt creative, fun, and easy ways of learning dance and enables them to be fit and socialise. It is the perfect platform for dance enthusiasts and dance professionals to come together."
  },
  {
    name: "Movies and Dramatics 🎭",
    image: "https://images.unsplash.com/photo-1503095396549-807759245b35?auto=format&fit=crop&q=80&w=800",
    description: "The club collaborates with young entertainers to celebrate various aspects of the performing arts. It welcomes students on board who are engrossed to explore more about the thespian world. It aims at finding out the innate artistic talents among students, nurturing them to their fullest, and providing a platform for students who have the talent, confidence and passion to do something unique. Drama Club promotes communication skills, teamwork, dialogue, socialisation, stages terminology, and working on acting skills."
  },
  {
    name: "Sports 🏆",
    image: "https://images.unsplash.com/photo-1461896736914-cbfb586041a8?auto=format&fit=crop&q=80&w=800",
    description: "The club looks for zealous and talented sportspersons and aims at promoting team spirit, leadership, and fitness. The students are allowed to participate in a broad variety of sports and recreational activities and to live a balanced life academically, athletically and socially. The club provides the opportunity to athletes from any field to practice, hone and master their athletic prowess. They host numerous competitions around the year for students from all streams."
  },
  {
    name: "Creative Arts & Media 🖌️",
    image: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&q=80&w=800",
    description: "From cave paintings to abstract art – creativity has always been here, manifesting in various forms, and embellishing and astonishing the world in the process. The club creates an outlet for this creative energy that resides within every living soul. It provides an opportunity for creative and artistic people to express and display their true vibrant, imaginative selves and aims in enriching and fostering an interest in art and personal expression through art."
  },
  {
    name: "Women Empowerment 💪",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=800",
    description: "The club is dedicated to educating and spreading awareness amongst people about women's issues and their empowerment. It encourages women to represent themselves and be a part of every field and creates an awareness about their capabilities. The mission of this club is to address gender inequality issues through presentations, symposiums, awareness camps, and discussions."
  },
  {
    name: "Self Defense Club 🥋",
    image: "https://images.unsplash.com/photo-1555597673-b21d5c935865?auto=format&fit=crop&q=80&w=800",
    description: "The club teaches students the basic skills and techniques required to defend themselves in times of need because self-defence is not a choice but a need. It is about educating the mind and body in martial arts for self-defence in a safe and constructive environment."
  },
  {
    name: "Social Club 🤝",
    image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&q=80&w=800",
    description: "The club is dedicated to fostering the spirit of generosity, humility, empathy, camaraderie and social corporation in the youth of the institute, making them aware of their social responsibilities and encouraging them to serve the community. It organises social service events, awareness camps and volunteering events where the young people of the institute can help make the world a bit more tolerant, kind and compassionate."
  },
  {
    name: "Gaming 🎮",
    image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=800",
    description: "Have high gaming skills but don't know how to start? The club is devoted to teaching, promoting, and organising e-games and e-gaming tournaments. The club helps students learn the required techniques, hacks, and tricks to thoroughly enjoy e-games and give a sense of accomplishment and progression in life."
  },
  {
    name: "Quiz 🧠",
    image: "https://images.unsplash.com/photo-1484067011813-7104e41d132a?auto=format&fit=crop&q=80&w=800",
    description: "Quizzing is an art and a test of intellect. The club aims at identifying students with such quizzing talent and creating opportunities for them to sharpen their quizzing skills. It is a unique and exciting way to motivate, encourage and reward the flair for quizzing and an unquenchable thirst for knowledge."
  }
];
;

const ClubsPage = () => {
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    void fetchEvents()
      .then((data) => setEvents(data.events ?? []))
      .catch(() => setEvents([]));
  }, []);

  return (
    <div className="max-w-[1600px] mx-auto space-y-6 pb-24 px-3 w-full min-h-screen">
      <div className="mb-10 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 mb-4">
           <Badge variant="outline" className="border-pink-500/25 bg-pink-500/10 text-[10px] uppercase tracking-[0.22em] text-pink-400">
              Societies
           </Badge>
           <div className="h-px w-8 bg-pink-500/20" />
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight mb-4 font-space-grotesk">
          Campus <span className="text-pink-400">Clubs</span>
        </h1>
        <p className="text-sm text-zinc-400 max-w-2xl leading-relaxed">
          Explore the vibrant student community. Join a club to nurture your talents, 
          celebrate diversity, and make lasting positive changes in the world.
        </p>
      </div>

      <section className="space-y-5">
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="border-sky-500/25 bg-sky-500/10 text-[10px] uppercase tracking-[0.22em] text-sky-400">
            Admin Events
          </Badge>
          <div className="h-px w-8 bg-sky-500/20" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {events.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-white/10 p-8 text-sm text-zinc-500">
              No club events are live right now.
            </div>
          ) : null}
          {events.map((event) => (
            <Card key={event.id} className="overflow-hidden bg-zinc-900/30 border-zinc-800/50 backdrop-blur-sm">
              {event.image_url ? (
                <div className="relative h-52 w-full">
                  <Image src={event.image_url} alt={event.title} fill className="object-cover" />
                </div>
              ) : null}
              <div className="p-6 space-y-4">
                <div>
                  <div className="text-[10px] uppercase tracking-[0.22em] text-sky-400">Campus Event</div>
                  <h2 className="mt-2 text-2xl font-bold text-white font-space-grotesk">{event.title}</h2>
                </div>
                <p className="text-sm leading-relaxed text-zinc-400">{event.description}</p>
                <div className="grid gap-2 text-xs text-zinc-400">
                  <div className="flex items-center gap-2"><CalendarDays size={14} /> {event.event_date} · {event.event_time}</div>
                  <div className="flex items-center gap-2"><MapPin size={14} /> {event.venue}</div>
                  {event.registration_link ? (
                    <a href={event.registration_link} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sky-300 hover:text-sky-200">
                      <Link2 size={14} /> Registration Link
                    </a>
                  ) : null}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {clubs.map((club, index) => (
          <Card 
            key={index} 
            className="group relative overflow-hidden bg-zinc-900/30 border-zinc-800/50 hover:border-pink-500/30 transition-all duration-500 flex flex-col shadow-2xl backdrop-blur-sm"
          >
            {/* Image Section */}
            <div className="relative h-56 w-full overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 to-transparent z-10" />
              <Image 
                src={club.image} 
                alt={club.name}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute top-4 right-4 z-20">
                <div className="bg-black/40 backdrop-blur-md rounded-full p-2 border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Info size={18} className="text-pink-400" />
                </div>
              </div>
            </div>

            {/* Content Section */}
            <div className="p-6 flex flex-col flex-1 relative z-20">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-pink-500/10 flex items-center justify-center border border-pink-500/20 group-hover:bg-pink-500/20 transition-colors">
                  <Sparkles size={20} className="text-pink-400" />
                </div>
                <h2 className="text-xl font-bold text-white group-hover:text-pink-400 transition-colors font-space-grotesk">
                  {club.name}
                </h2>
              </div>
              
              <p className="text-zinc-400 text-sm leading-relaxed mb-6 line-clamp-4 group-hover:line-clamp-none transition-all">
                {club.description}
              </p>

              <div className="mt-auto flex items-center justify-between pt-4 border-t border-white/5">
                <div className="flex items-center gap-2 text-xs text-zinc-500 font-medium uppercase tracking-widest">
                  <Users size={14} />
                  <span>Student Led</span>
                </div>
                <button className="text-xs font-bold text-pink-400 hover:text-pink-300 transition-colors uppercase tracking-widest">
                  Join Now
                </button>
              </div>
            </div>
            
            {/* Hover Accent */}
            <div className="absolute inset-0 border-2 border-pink-500/0 group-hover:border-pink-500/10 pointer-events-none transition-all duration-500 rounded-2xl" />
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ClubsPage;
