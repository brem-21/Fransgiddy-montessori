"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  GraduationCap,
  BookOpen,
  Shield,
  Users,
  Calendar,
  Megaphone,
  ChevronRight,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Slideshow } from "@/components/Slideshow";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { announcementApi } from "@/lib/api";
import type { Announcement } from "@/types";

export default function LandingPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [announcementsLoading, setAnnouncementsLoading] = useState(true);
  const [selected, setSelected] = useState<Announcement | null>(null);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const res = await announcementApi.getPublic();
        setAnnouncements(res.data.data.slice(0, 3));
      } catch {
        // silent fail for public page
      } finally {
        setAnnouncementsLoading(false);
      }
    };
    fetchAnnouncements();
  }, []);

  const apiBase = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") ?? "";

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-16 overflow-hidden bg-gradient-to-br from-indigo-700 via-indigo-600 to-indigo-500 text-white">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
          <div className="max-w-3xl">
            <Badge className="mb-4 bg-indigo-400 text-white border-indigo-300 text-xs">
              Enrolment Open 2024/2025
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Welcome to{" "}
              <span className="text-indigo-200">Fransgiddy</span>{" "}
              Royal School
            </h1>
            <p className="text-xl text-indigo-100 mb-8 max-w-2xl leading-relaxed">
              Nurturing curious minds through child-centred Montessori education.
              We cultivate independence, creativity and a lifelong love of learning
              in every child.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button
                asChild
                size="lg"
                className="bg-white text-indigo-700 hover:bg-indigo-50 font-semibold"
              >
                <Link href="/register">
                  Apply Now <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-indigo-600 bg-transparent"
              >
                <Link href="/login">Login</Link>
              </Button>
            </div>
          </div>
        </div>
        <div className="relative h-16 bg-gradient-to-b from-transparent to-white" />
      </section>

      {/* Photo Slideshow */}
      <Slideshow />

      {/* About Section */}
      <section id="about" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Our Montessori Philosophy
            </h2>
            <p className="text-gray-600 mb-4 leading-relaxed">
              At Fransgiddy Royal School, we believe every child is a natural learner.
              Our classrooms are carefully prepared environments where children are
              empowered to direct their own learning at their own pace.
            </p>
            <p className="text-gray-600 leading-relaxed">
              Founded on the principles of Dr Maria Montessori, our approach fosters
              independence, critical thinking and a deep love for knowledge. Our
              trained teachers guide rather than instruct, observing each child&apos;s
              unique developmental journey.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Years of Excellence", value: "10+" },
              { label: "Happy Students", value: "500+" },
              { label: "Qualified Teachers", value: "25+" },
              { label: "Success Rate", value: "98%" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-indigo-50 rounded-xl p-5 text-center"
              >
                <div className="text-3xl font-bold text-indigo-600 mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              Why Choose Us
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              We provide a holistic education that prepares children for a
              rapidly changing world.
            </p>
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              {
                icon: <Users className="h-8 w-8 text-indigo-600" />,
                title: "Expert Teachers",
                desc: "All our educators are certified Montessori practitioners with years of experience nurturing young learners.",
              },
              {
                icon: <BookOpen className="h-8 w-8 text-indigo-600" />,
                title: "Holistic Learning",
                desc: "Our curriculum integrates academics, arts, physical activity and social-emotional learning for whole-child development.",
              },
              {
                icon: <Shield className="h-8 w-8 text-indigo-600" />,
                title: "Safe Environment",
                desc: "We maintain a secure, nurturing and inclusive campus where every child feels valued and can thrive confidently.",
              },
            ].map((feature) => (
              <Card key={feature.title} className="text-center p-6">
                <CardContent className="pt-4">
                  <div className="flex justify-center mb-4">{feature.icon}</div>
                  <h3 className="font-semibold text-gray-900 text-lg mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    {feature.desc}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Announcements Section */}
      <section id="announcements" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-3xl font-bold text-gray-900">
            Latest News &amp; Events
          </h2>
          <Megaphone className="h-6 w-6 text-indigo-400" />
        </div>

        {announcementsLoading ? (
          <div className="grid sm:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-40 bg-gray-100 animate-pulse rounded-xl"
              />
            ))}
          </div>
        ) : announcements.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl">
            <Megaphone className="h-10 w-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400">No announcements at the moment.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-3 gap-6">
            {announcements.map((a) => {
              const imageUrl = a.mediaUrls?.find((u) =>
                /\.(jpe?g|png|gif|webp|svg)$/i.test(u)
              );
              return (
                <Card
                  key={a.id}
                  onClick={() => setSelected(a)}
                  className="hover:shadow-lg transition-shadow overflow-hidden cursor-pointer group"
                >
                  {imageUrl && (
                    <div className="h-44 overflow-hidden bg-gray-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={`${apiBase}${imageUrl}`}
                        alt={a.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="secondary" className="text-xs uppercase">
                        {a.type}
                      </Badge>
                    </div>
                    <CardTitle className="text-base">{a.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-500 text-sm line-clamp-3 mb-3">
                      {a.content}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <Calendar className="h-3 w-3" />
                        {new Date(a.createdAt).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </div>
                      <span className="text-xs text-indigo-600 font-medium group-hover:underline">
                        Read more →
                      </span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      {/* Admissions CTA Section */}
      <section
        id="admissions"
        className="py-20 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <GraduationCap className="h-12 w-12 text-indigo-200 mx-auto mb-4" />
          <h2 className="text-3xl font-bold mb-4">Begin Your Child&apos;s Journey</h2>
          <p className="text-indigo-100 mb-8 max-w-xl mx-auto leading-relaxed">
            Admissions are open for the 2024/2025 academic year. Fill in the
            enquiry form and our team will get back to you shortly.
          </p>
          <Button
            asChild
            size="lg"
            className="bg-white text-indigo-700 hover:bg-indigo-50 font-semibold"
          >
            <Link href="/register">
              Start Application <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Announcement Detail Dialog */}
      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selected && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="secondary" className="text-xs uppercase">
                    {selected.type}
                  </Badge>
                </div>
                <DialogTitle className="text-xl leading-snug pr-6">
                  {selected.title}
                </DialogTitle>
                <div className="flex items-center gap-4 text-xs text-gray-400 pt-1">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(selected.createdAt).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                  {selected.authorName && (
                    <span className="text-gray-400">By {selected.authorName}</span>
                  )}
                </div>
              </DialogHeader>

              {/* Media gallery */}
              {selected.mediaUrls && selected.mediaUrls.length > 0 && (
                <div className="space-y-3 mt-2">
                  {selected.mediaUrls
                    .filter((u) => /\.(jpe?g|png|gif|webp|svg)$/i.test(u))
                    .map((u, i) => (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        key={i}
                        src={`${apiBase}${u}`}
                        alt={`${selected.title} image ${i + 1}`}
                        className="w-full rounded-lg object-cover max-h-72"
                      />
                    ))}
                </div>
              )}

              {/* Full content */}
              <div className="mt-4 text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                {selected.content}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <footer id="contact" className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <GraduationCap className="h-6 w-6 text-indigo-400" />
                <span className="font-bold text-white">
                  Fransgiddy Royal School
                </span>
              </div>
              <p className="text-sm leading-relaxed text-gray-400">
                Nurturing curious minds through child-centred Montessori
                education since 2014.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                {[
                  { label: "Home", href: "/" },
                  { label: "About", href: "/#about" },
                  { label: "Admissions", href: "/register" },
                  { label: "Login", href: "/login" },
                ].map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="hover:text-indigo-400 transition-colors"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3">Contact</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>123 School Lane, Accra, Ghana</li>
                <li>+233 20 000 0000</li>
                <li>info@fransgiddy.edu.gh</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 pt-6 text-center text-sm text-gray-500">
            &copy; {new Date().getFullYear()} Fransgiddy Royal School. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
