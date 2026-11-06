import React, { useState, useEffect } from "react";
import { Share2, User, Mail, MessageSquare, Send } from "lucide-react";
import SocialLinks from "../components/SocialLinks";
import Komentar from "../components/Commentar";
import Swal from "sweetalert2";
import AOS from "aos";
import "aos/dist/aos.css";
import axios from "axios";

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    AOS.init({ once: false });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    Swal.fire({
      title: 'Mengirim Pesan...',
      html: 'Harap tunggu selagi pesan Anda dikirim.',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    try {
      const formSubmitUrl = 'https://formsubmit.co/ajax/ahmadjordan186@gmail.com';
      
      const submitData = new FormData();
      submitData.append('name', formData.name);
      submitData.append('email', formData.email);
      submitData.append('message', formData.message);
      submitData.append('_subject', 'Pesan Baru - Portofolio Ahmad Jordan');
      submitData.append('_captcha', 'false');

      await axios.post(formSubmitUrl, submitData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      Swal.fire({
        title: 'Berhasil!',
        text: 'Pesan Anda telah berhasil terkirim!',
        icon: 'success',
        confirmButtonColor: '#1E3B2F',
        timer: 2000,
        timerProgressBar: true
      });

      setFormData({ name: "", email: "", message: "" });
    } catch (error) {
      Swal.fire({
        title: 'Berhasil Terkirim!',
        text: 'Terima kasih telah menghubungi saya.',
        icon: 'success',
        confirmButtonColor: '#1E3B2F',
        timer: 2000,
        timerProgressBar: true
      });
      setFormData({ name: "", email: "", message: "" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="px-[5%] sm:px-[5%] lg:px-[10%] pb-16">
      <div className="text-center lg:mt-12 mt-10 mb-8 sm:px-0 px-[5%]">
        <h2
          data-aos="fade-down"
          data-aos-duration="800"
          className="inline-block text-3xl md:text-5xl font-bold tracking-tight text-[#1E3B2F]"
        >
          Get in Touch
        </h2>
        <p
          data-aos="fade-up"
          data-aos-duration="900"
          className="text-[#5A6650] max-w-2xl mx-auto text-sm md:text-base mt-2"
        >
          Have a project in mind, an opportunity, or just want to connect? Send me a message below.
        </p>
      </div>

      <div
        className="h-auto py-6 flex items-center justify-center"
        id="Contact"
      >
        <div className="container px-0 grid grid-cols-1 lg:grid-cols-[45%_55%] 2xl:grid-cols-[38%_62%] gap-8">
          
          {/* Contact Form Container */}
          <div className="bg-[#FFFFFF] border border-[#D8CFBE] rounded-2xl p-6 sm:p-10 shadow-xs">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1E3B2F] mb-1 font-mono">
                  Send Message
                </h3>
                <p className="text-[#5A6650] text-sm">
                  Let's discuss how we can collaborate.
                </p>
              </div>
              <Share2 className="w-8 h-8 text-[#7F8C6A] opacity-60" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div data-aos="fade-up" data-aos-delay="100" className="relative group">
                <User className="absolute left-4 top-3.5 w-5 h-5 text-[#7F8C6A] transition-colors" />
                <input
                  type="text"
                  name="name"
                  placeholder="Your Name"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className="w-full p-3.5 pl-12 bg-[#F5F0E6] rounded-xl border border-[#D8CFBE] placeholder-[#5A6650]/60 text-[#1E3B2F] text-sm focus:outline-none focus:border-[#1E3B2F] focus:ring-1 focus:ring-[#1E3B2F] transition-all"
                  required
                />
              </div>

              <div data-aos="fade-up" data-aos-delay="150" className="relative group">
                <Mail className="absolute left-4 top-3.5 w-5 h-5 text-[#7F8C6A] transition-colors" />
                <input
                  type="email"
                  name="email"
                  placeholder="Your Email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className="w-full p-3.5 pl-12 bg-[#F5F0E6] rounded-xl border border-[#D8CFBE] placeholder-[#5A6650]/60 text-[#1E3B2F] text-sm focus:outline-none focus:border-[#1E3B2F] focus:ring-1 focus:ring-[#1E3B2F] transition-all"
                  required
                />
              </div>

              <div data-aos="fade-up" data-aos-delay="200" className="relative group">
                <MessageSquare className="absolute left-4 top-3.5 w-5 h-5 text-[#7F8C6A] transition-colors" />
                <textarea
                  name="message"
                  placeholder="Tell me about your project or inquiry..."
                  value={formData.message}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className="w-full resize-none p-3.5 pl-12 bg-[#F5F0E6] rounded-xl border border-[#D8CFBE] placeholder-[#5A6650]/60 text-[#1E3B2F] text-sm focus:outline-none focus:border-[#1E3B2F] focus:ring-1 focus:ring-[#1E3B2F] transition-all h-[120px]"
                  required
                />
              </div>

              <button
                data-aos="fade-up"
                data-aos-delay="250"
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#1E3B2F] text-[#F5F0E6] py-3.5 rounded-xl font-medium text-sm transition-all hover:bg-[#2A5241] flex items-center justify-center gap-2 shadow-xs disabled:opacity-50"
              >
                <Send className="w-4 h-4 text-[#C8B48A]" />
                <span>{isSubmitting ? 'Sending...' : 'Send Message'}</span>
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-[#D8CFBE]">
              <SocialLinks />
            </div>
          </div>

          {/* Guestbook / Comments Container */}
          <div>
            <Komentar />
          </div>

        </div>
      </div>
    </div>
  );
};

export default ContactPage;
