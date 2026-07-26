"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
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
import { Reveal, staggerContainer, staggerItem } from "@/components/Reveal";
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

const PAGE_SIZE = 3;

export default function LandingPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [announcementsLoading, setAnnouncementsLoading] = useState(true);
  const [selected, setSelected] = useState<Announcement | null>(null);
  const [page, setPage] = useState(0);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const res = await announcementApi.getPublic();
        setAnnouncements(res.data.data);
      } catch {
        // silent fail for public page
      } finally {
        setAnnouncementsLoading(false);
      }
    };
    fetchAnnouncements();
  }, []);

  const totalPages = Math.ceil(announcements.length / PAGE_SIZE);
  const paginated = announcements.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  const apiBase = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") ?? "";

  return (
    <div className="min-h-screen bg-white">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[200] focus:bg-clay focus:text-white focus:px-4 focus:py-2 focus:rounded-none focus:text-sm focus:font-bold"
      >
        Skip to main content
      </a>
      <Navbar />

      <main id="main-content">
      {/* Hero Section */}
      <section className="relative pt-16 overflow-hidden bg-white text-ink">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative max-w-page mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32"
        >
          <div className="max-w-3xl">
            <Badge variant="secondary" className="mb-4 text-xs">
              Enrolment Open 2024/2025
            </Badge>
            <h1 className="text-heading-lg sm:text-display font-bold text-ink mb-6">
              Welcome to Fransgiddy Royal School.
            </h1>
            <p className="text-[18px] leading-[29px] text-ash mb-8 max-w-2xl">
              Nurturing curious minds through child-centred Montessori education.
              We cultivate independence, creativity and a lifelong love of learning
              in every child.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button asChild size="lg">
                <Link href="/register">
                  Apply Now <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="dark">
                <Link href="/login">Login</Link>
              </Button>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Photo Slideshow */}
      <Slideshow />

      {/* About Section */}
      <section id="about" className="py-20 max-w-page mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <Reveal>
            <h2 className="text-heading font-bold text-ink mb-4">
              Our Montessori Philosophy
            </h2>
            <p className="text-ash mb-4 leading-relaxed">
              At Fransgiddy Royal School, we believe every child is a natural learner.
              Our classrooms are carefully prepared environments where children are
              empowered to direct their own learning at their own pace.
            </p>
            <p className="text-ash leading-relaxed">
              Founded on the principles of Dr Maria Montessori, our approach fosters
              independence, critical thinking and a deep love for knowledge. Our
              trained teachers guide rather than instruct, observing each child&apos;s
              unique developmental journey.
            </p>
          </Reveal>
          <motion.div
            className="grid grid-cols-2 gap-4"
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
          >
            {[
              { label: "Years of Excellence", value: "10+" },
              { label: "Happy Students", value: "500+" },
              { label: "Qualified Teachers", value: "25+" },
              { label: "Success Rate", value: "98%" },
            ].map((stat) => (
              <motion.div
                key={stat.label}
                variants={staggerItem}
                className="bg-white rounded-none p-5 text-center"
              >
                <div className="text-heading font-bold text-ink mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-ash">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-white">
        <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center mb-12">
            <h2 className="text-heading font-bold text-ink mb-3">
              Why Choose Us
            </h2>
            <p className="text-ash max-w-xl mx-auto">
              We provide a holistic education that prepares children for a
              rapidly changing world.
            </p>
          </Reveal>
          <motion.div
            className="grid sm:grid-cols-3 gap-6"
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
          >
            {[
              {
                icon: <Users className="h-8 w-8 text-ink" />,
                title: "Expert Teachers",
                desc: "All our educators are certified Montessori practitioners with years of experience nurturing young learners.",
              },
              {
                icon: <BookOpen className="h-8 w-8 text-ink" />,
                title: "Holistic Learning",
                desc: "Our curriculum integrates academics, arts, physical activity and social-emotional learning for whole-child development.",
              },
              {
                icon: <Shield className="h-8 w-8 text-ink" />,
                title: "Safe Environment",
                desc: "We maintain a secure, nurturing and inclusive campus where every child feels valued and can thrive confidently.",
              },
            ].map((feature) => (
              <motion.div key={feature.title} variants={staggerItem}>
                <Card className="text-center p-6 h-full transition-transform hover:-translate-y-1">
                  <CardContent className="pt-4">
                    <div className="flex justify-center mb-4">{feature.icon}</div>
                    <h3 className="font-bold text-ink text-lg mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-ash text-sm leading-relaxed">
                      {feature.desc}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Announcements Section */}
      <section id="announcements" className="py-20 max-w-page mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal className="flex items-center justify-between mb-10">
          <h2 className="text-heading font-bold text-ink">
            Latest News &amp; Events
          </h2>
          <Megaphone className="h-6 w-6 text-ash" />
        </Reveal>

        {announcementsLoading ? (
          <div className="grid sm:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-40 bg-pebble/20 animate-pulse rounded-none"
              />
            ))}
          </div>
        ) : announcements.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-none">
            <Megaphone className="h-10 w-10 text-ash mx-auto mb-3" />
            <p className="text-ash">No announcements at the moment.</p>
          </div>
        ) : (
          <>
          <motion.div
            className="grid sm:grid-cols-3 gap-6"
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
          >
            {paginated.map((a) => {
              const imageUrl = a.mediaUrls?.find((u) =>
                /\.(jpe?g|png|gif|webp|svg)$/i.test(u)
              );
              return (
                <motion.div key={a.id} variants={staggerItem} whileTap={{ scale: 0.98 }}>
                  <Card
                    onClick={() => setSelected(a)}
                    className="hover:border-ink hover:-translate-y-1 transition-all overflow-hidden cursor-pointer group h-full"
                  >
                    {imageUrl && (
                      <div className="bg-white">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={`${apiBase}${imageUrl}`}
                          alt={a.title}
                          className="w-full object-contain"
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
                      <p className="text-ash text-sm line-clamp-3 mb-3">
                        {a.content}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-xs text-ash">
                          <Calendar className="h-3 w-3" />
                          {new Date(a.createdAt).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </div>
                        <span className="text-xs text-ink font-bold group-hover:underline">
                          Read more →
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-10">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
              >
                <ChevronRight className="h-4 w-4 rotate-180 mr-1" />
                Previous
              </Button>
              <span className="text-sm text-ash">
                Page {page + 1} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page === totalPages - 1}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          )}
          </>
        )}
      </section>

      {/* Admissions CTA Section */}
      <section
        id="admissions"
        className="py-20 bg-midnight text-white"
      >
        <Reveal className="max-w-page mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <GraduationCap className="h-12 w-12 text-white mx-auto mb-4" />
          <h2 className="text-heading font-bold mb-4">Begin Your Child&apos;s Journey.</h2>
          <p className="text-[18px] leading-[29px] text-ash mb-8 max-w-xl mx-auto">
            Admissions are open for the 2024/2025 academic year. Fill in the
            enquiry form and our team will get back to you shortly.
          </p>
          <Button asChild size="lg">
            <Link href="/register">
              Start Application <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </Reveal>
      </section>

      </main>

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
                <div className="flex items-center gap-4 text-xs text-ash pt-1">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(selected.createdAt).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                  {selected.authorName && (
                    <span className="text-ash">By {selected.authorName}</span>
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
                        className="w-full rounded-none object-contain"
                      />
                    ))}
                </div>
              )}

              {/* Full content */}
              <div className="mt-4 text-ink text-sm leading-relaxed whitespace-pre-wrap">
                {selected.content}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <footer id="contact" className="bg-ink text-ash py-12">
        <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <GraduationCap className="h-6 w-6 text-ash" />
                <span className="font-bold text-white">
                  Fransgiddy Royal School
                </span>
              </div>
              <p className="text-sm leading-relaxed text-ash">
                Nurturing curious minds through child-centred Montessori
                education since 2014.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-white mb-3">Quick Links</h4>
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
                      className="hover:text-white transition-colors"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-3">Contact</h4>
              <ul className="space-y-2 text-sm text-ash">
                <li>123 School Lane, Accra, Ghana</li>
                <li>+233 20 000 0000</li>
                <li>info@fransgiddy.edu.gh</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-pebble pt-6 text-center text-sm text-ash">
            &copy; {new Date().getFullYear()} Fransgiddy Royal School. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
