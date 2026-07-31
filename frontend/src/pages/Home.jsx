import React from "react";
import Hero from "../components/home/Hero";
import Features from "../components/home/Features";
import FeaturedAlumni from "../components/home/featuredAlumni";
import SuccessStories from "../components/home/successStories";

export default function Home() {
  return (
    <>
      <Hero />
      <Features />
      <FeaturedAlumni />
      <SuccessStories />
    </>
  );
}


