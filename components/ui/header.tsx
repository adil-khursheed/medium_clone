"use client";

import Link from "next/link";
import React from "react";
import { Button } from "./button";
import { Authenticated, Unauthenticated } from "convex/react";
import { SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { Edit } from "lucide-react";
import ThemeToggle from "./theme-toggle";

const Header = () => {
  return (
    <header className="p-4">
      <nav className="flex items-center justify-between">
        <Link href={"/"}>
          <Button variant={"ghost"} className="cursor-pointer">
            Medium
          </Button>
        </Link>

        <div>
          <ul className="flex items-center">
            <li>
              <ThemeToggle />
            </li>
            <li>
              <Link href={"/about"}>
                <Button
                  variant={"ghost"}
                  className="rounded-full cursor-pointer">
                  Our Story
                </Button>
              </Link>
            </li>
            <li>
              <Link href={"/membership"}>
                <Button
                  variant={"ghost"}
                  className="rounded-full cursor-pointer">
                  Membership
                </Button>
              </Link>
            </li>
            <li>
              <Unauthenticated>
                <SignInButton mode="modal">
                  <Button
                    variant={"ghost"}
                    className="rounded-full cursor-pointer">
                    Write
                  </Button>
                </SignInButton>
              </Unauthenticated>
              <Authenticated>
                <Link href={"/write"}>
                  <Button
                    variant={"ghost"}
                    className="rounded-full cursor-pointer">
                    <Edit /> Write
                  </Button>
                </Link>
              </Authenticated>
            </li>
            <Unauthenticated>
              <li>
                <SignInButton mode="modal">
                  <Button
                    variant={"ghost"}
                    className="rounded-full cursor-pointer">
                    Sign In
                  </Button>
                </SignInButton>
              </li>
              <li>
                <SignUpButton mode="modal">
                  <Button className="rounded-full cursor-pointer">
                    Get Started
                  </Button>
                </SignUpButton>
              </li>
            </Unauthenticated>

            <Authenticated>
              <li className="size-9 flex items-center justify-center">
                <UserButton />
              </li>
            </Authenticated>
          </ul>
        </div>
      </nav>
    </header>
  );
};

export default Header;
