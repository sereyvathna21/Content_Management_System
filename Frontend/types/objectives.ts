import React from "react";

export type ColorSet = {
  primary: string;
  bg: string;
  border: string;
  text: string;
  glow: string;
};

export type Objective = {
  title: string;
  description: string;
  color: ColorSet;
  icon: React.ReactElement;
};
