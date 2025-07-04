"use client"

import { useEffect, useRef } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger)
}

export const useGSAP = () => {
  const initialized = useRef(false)

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true

    // Hero animations
    const heroTl = gsap.timeline()
    heroTl
      .from(".hero-title", {
        duration: 1.2,
        y: 100,
        opacity: 0,
        ease: "power3.out",
      })
      .from(
        ".hero-subtitle",
        {
          duration: 1,
          y: 50,
          opacity: 0,
          ease: "power3.out",
        },
        "-=0.8",
      )
      .from(
        ".hero-description",
        {
          duration: 1,
          y: 30,
          opacity: 0,
          ease: "power3.out",
        },
        "-=0.6",
      )
      .from(
        ".hero-buttons",
        {
          duration: 1,
          y: 30,
          opacity: 0,
          ease: "power3.out",
        },
        "-=0.4",
      )

    // Section animations
    gsap.utils.toArray(".animate-section").forEach((section: any) => {
      gsap.from(section, {
        duration: 1,
        y: 80,
        opacity: 0,
        ease: "power3.out",
        scrollTrigger: {
          trigger: section,
          start: "top 80%",
          end: "bottom 20%",
          toggleActions: "play none none reverse",
        },
      })
    })

    // Menu card animations
    gsap.utils.toArray(".menu-card").forEach((card: any, index: number) => {
      gsap.from(card, {
        duration: 0.8,
        y: 60,
        opacity: 0,
        ease: "power3.out",
        delay: index * 0.1,
        scrollTrigger: {
          trigger: card,
          start: "top 85%",
          toggleActions: "play none none reverse",
        },
      })
    })

    // How it works steps
    gsap.utils.toArray(".step-card").forEach((step: any, index: number) => {
      gsap.from(step, {
        duration: 1,
        y: 50,
        opacity: 0,
        ease: "power3.out",
        delay: index * 0.2,
        scrollTrigger: {
          trigger: step,
          start: "top 80%",
          toggleActions: "play none none reverse",
        },
      })
    })

    // Gallery images
    gsap.utils.toArray(".gallery-image").forEach((image: any, index: number) => {
      gsap.from(image, {
        duration: 0.8,
        scale: 0.8,
        opacity: 0,
        ease: "power3.out",
        delay: index * 0.1,
        scrollTrigger: {
          trigger: image,
          start: "top 85%",
          toggleActions: "play none none reverse",
        },
      })
    })

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill())
    }
  }, [])
}
