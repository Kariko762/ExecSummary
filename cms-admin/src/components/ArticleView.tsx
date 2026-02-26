import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ChevronLeft, Edit3, Tag, Clock, Users, Eye, MessageCircle, 
  ThumbsUp, Share2, BookOpen, FileText, TrendingUp, ExternalLink,
  Calendar, User
} from 'lucide-react';

interface ArticleViewProps {
  onClose?: () => void;
}

export default function ArticleView({ onClose }: ArticleViewProps) {
  const [liked, setLiked] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1f2e] via-[#1e2533] to-[#24293a] text-white">
      {/* Top Navigation Bar */}
      <div className="border-b border-slate-700/30 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-[1920px] mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3 text-sm text-slate-400">
            <button onClick={onClose} className="flex items-center gap-2 hover:text-white transition-colors">
              <ChevronLeft className="w-4 h-4" />
              Articles
            </button>
            <span>/</span>
            <span className="text-white">Post</span>
          </div>
          <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
            <Edit3 className="w-4 h-4" />
            Edit Article
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-[1920px] mx-auto px-6 py-8">
        <div className="grid grid-cols-12 gap-6">
          
          {/* Left Column - Main Content */}
          <div className="col-span-8 space-y-6">
            
            {/* Hero Section */}
            <div className="bg-slate-800/30 border border-slate-700/40 rounded-xl p-8 backdrop-blur-sm">
              <div className="flex gap-8">
                <div className="flex-1">
                  <h1 className="text-3xl font-roobert-bold text-white mb-4 leading-tight">
                    B2B Digital Buyers Guide Insights:<br />
                    Shaping a Digital-First GTM Strategy
                  </h1>
                  
                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="px-3 py-1 bg-blue-500/20 text-blue-400 text-xs font-medium rounded-full border border-blue-500/30">
                      B2B GTM
                    </span>
                    <span className="px-3 py-1 bg-purple-500/20 text-purple-400 text-xs font-medium rounded-full border border-purple-500/30">
                      Buyer Journey
                    </span>
                    <span className="px-3 py-1 bg-cyan-500/20 text-cyan-400 text-xs font-medium rounded-full border border-cyan-500/30">
                      Digital Transformation
                    </span>
                    <span className="px-3 py-1 bg-orange-500/20 text-orange-400 text-xs font-medium rounded-full border border-orange-500/30">
                      Has Ever Misalign?
                    </span>
                  </div>

                  {/* Author Info */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold">
                      CD
                    </div>
                    <div className="text-sm">
                      <div className="text-white font-medium">Claire Davidson</div>
                      <div className="text-slate-400">2 months ago • 3 stakeholders notified</div>
                    </div>
                  </div>
                </div>

                {/* Hero Image */}
                <div className="w-64 h-40 bg-gradient-to-br from-blue-900/20 to-cyan-900/20 rounded-lg border border-slate-700/40 flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 to-transparent"></div>
                  <img 
                    src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='120' viewBox='0 0 200 120'%3E%3Crect fill='%231e293b' width='200' height='120'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23475569' font-family='Arial' font-size='14'%3EDashboard%3C/text%3E%3C/svg%3E"
                    alt="Digital Dashboard"
                    className="relative z-10 opacity-60"
                  />
                </div>
              </div>
            </div>

            {/* The New Reality Section */}
            <div className="bg-slate-800/30 border border-slate-700/40 rounded-xl p-8 backdrop-blur-sm">
              <h2 className="text-2xl font-roobert-semibold text-white mb-4">
                The New Reality for B2B Digital Buyers
              </h2>
              <p className="text-slate-300 leading-relaxed mb-6">
                Today's B2B buyers operate in a digital environment, doing most of digital-first, self-service 
                GTM approaches & planning hosting in Elastic online.
              </p>

              {/* Quote Callout */}
              <div className="bg-blue-500/10 border-l-4 border-blue-500 rounded-r-lg p-4 mb-6">
                <div className="flex gap-3">
                  <div className="text-blue-400 text-3xl leading-none">"</div>
                  <div>
                    <p className="text-slate-200 italic mb-2">
                      B2B buyers spend only 17% of the buying journey interacting directly with 
                      potential suppliers. The rest is spent on independent research online.
                    </p>
                    <p className="text-slate-400 text-sm">— Gartner</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Key Insights Section */}
            <div className="bg-slate-800/30 border border-slate-700/40 rounded-xl p-8 backdrop-blur-sm">
              <h2 className="text-2xl font-roobert-semibold text-white mb-6">
                Key Insights from the Gartner B2B Digital Buyers Guide
              </h2>

              {/* Insight 1 */}
              <div className="mb-6">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-400 font-semibold">1</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-roobert-semibold text-white mb-3">
                      Sellers Are a Secondary Source
                    </h3>
                    <ul className="space-y-2 text-slate-300">
                      <li className="flex gap-2">
                        <span className="text-blue-400 mt-1">•</span>
                        <span>B2B buyers spend only 17% of the buying journey interacting directly with potential suppliers.</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-blue-400 mt-1">•</span>
                        <span>Course: Independent drivers research sheet.</span>
                      </li>
                    </ul>
                    <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
                      <FileText className="w-3 h-3" />
                      <span>Finance GB • ReblogKSeb • Support Edesl</span>
                      <BookOpen className="w-3 h-3 ml-2" />
                      <span>Digital Buyers Guide</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Insight 2 */}
              <div className="mb-6">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center flex-shrink-0">
                    <span className="text-purple-400 font-semibold">2</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-roobert-semibold text-white mb-3">
                      Demand for Self-Service
                    </h3>
                    <ul className="space-y-2 text-slate-300">
                      <li className="flex gap-2">
                        <span className="text-purple-400 mt-1">•</span>
                        <span>75% of B2B buyers want to self-educate on product deeply before engaging sales teams.</span>
                      </li>
                    </ul>
                    <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
                      <FileText className="w-3 h-3" />
                      <span>Source: @ ListenedWith Buyer Essent</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Insight 3 */}
              <div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center flex-shrink-0">
                    <span className="text-cyan-400 font-semibold">3</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-roobert-semibold text-white mb-3">
                      Digital Research Dominates
                    </h3>
                    <ul className="space-y-2 text-slate-300">
                      <li className="flex gap-2">
                        <span className="text-cyan-400 mt-1">•</span>
                        <span>55% of the B2B buying process is spent consuming digital content and conducting independent online research.</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Reflection Section */}
            <div className="bg-slate-800/30 border border-slate-700/40 rounded-xl p-8 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-orange-500/20 border border-orange-500/30 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-orange-400" />
                </div>
                <h2 className="text-2xl font-roobert-semibold text-white">
                  Reflection for GTM Strategy
                </h2>
              </div>

              <ul className="space-y-3 text-slate-300">
                <li className="flex gap-3">
                  <span className="text-blue-400 mt-1">•</span>
                  <span>Is your GTM digital-first and buyer-contri is enough?</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-blue-400 mt-1">•</span>
                  <span>Aligning with the digital-first preferences of insided B2B buyers is now critical</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-blue-400 mt-1">•</span>
                  <span>Sales theme reset provide self-service, interactive product resources.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-blue-400 mt-1">•</span>
                  <span>Data-driven insights from reports like Gartner's guide should shape your GTM plan.</span>
                </li>
              </ul>

              {/* Stats Callout */}
              <div className="mt-6 bg-gradient-to-r from-blue-900/30 to-cyan-900/30 border border-blue-500/30 rounded-lg p-6">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <div className="text-2xl font-roobert-bold text-blue-400 mb-1">
                      81% <span className="text-lg text-slate-300">of B2B buyers say</span>
                    </div>
                    <p className="text-slate-300">
                      issues visualizing value slows down deal progression
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Related Articles */}
            <div className="bg-slate-800/30 border border-slate-700/40 rounded-xl p-6 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-roobert-semibold text-white">Related Articles</h3>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span>Hide selected</span>
                  <span className="px-2 py-1 bg-slate-700/50 rounded">41</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Article 1 */}
                <div className="bg-slate-700/30 border border-slate-600/30 rounded-lg p-4 hover:bg-slate-700/50 transition-colors cursor-pointer">
                  <div className="flex gap-3 mb-3">
                    <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <TrendingUp className="w-5 h-5 text-blue-400" />
                    </div>
                    <h4 className="text-sm font-roobert-semibold text-white leading-tight">
                      Forecasting Models Comparison
                    </h4>
                  </div>
                  <p className="text-xs text-slate-400 mb-3">
                    Comprehensive universe of forecasting methodologies, reinventing multi-forecast panel of KPIs
                  </p>
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <div className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      <span>Wertte</span>
                    </div>
                    <span>3 months ago</span>
                  </div>
                  <div className="mt-2 flex items-center gap-3 text-xs text-slate-400">
                    <div className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      <span>Comments</span>
                    </div>
                  </div>
                </div>

                {/* Article 2 */}
                <div className="bg-slate-700/30 border border-slate-600/30 rounded-lg p-4 hover:bg-slate-700/50 transition-colors cursor-pointer">
                  <div className="flex gap-3 mb-3">
                    <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <BarChart3 className="w-5 h-5 text-purple-400" />
                    </div>
                    <h4 className="text-sm font-roobert-semibold text-white leading-tight">
                      Top GTM Tools and Platform
                    </h4>
                  </div>
                  <p className="text-xs text-slate-400 mb-3">
                    Pinpoint Qualified space choosing free impact of immediate heads or continues via Million GTM
                  </p>
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <div className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      <span>Luke</span>
                    </div>
                    <span>4 comments</span>
                  </div>
                  <div className="mt-2 flex items-center gap-3 text-xs text-slate-400">
                    <div className="flex items-center gap-1">
                      <MessageCircle className="w-3 h-3" />
                      <span>4 comments</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Author Footer */}
            <div className="bg-slate-800/30 border border-slate-700/40 rounded-xl p-6 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold text-lg">
                    CD
                  </div>
                  <div>
                    <div className="text-lg font-roobert-semibold text-white">Claire Davidson</div>
                    <div className="flex items-center gap-4 text-sm text-slate-400 mt-1">
                      <div className="flex items-center gap-1">
                        <Edit3 className="w-3 h-3" />
                        <span>Draft saved 3 mins ago</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>Published 3 months ago</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="p-2 bg-slate-700/50 hover:bg-slate-700 rounded-lg transition-colors">
                    <ChevronLeft className="w-5 h-5 text-slate-400" />
                  </button>
                  <button className="p-2 bg-slate-700/50 hover:bg-slate-700 rounded-lg transition-colors">
                    <ChevronLeft className="w-5 h-5 text-slate-400 rotate-180" />
                  </button>
                </div>
              </div>
            </div>

            {/* Read Stats */}
            <div className="bg-slate-800/30 border border-slate-700/40 rounded-xl p-4 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-sm text-slate-300">
                  <FileText className="w-4 h-4 text-slate-400" />
                  <span>92 people have read this article since March 1</span>
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setLiked(!liked)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors ${
                      liked 
                        ? 'bg-pink-500/20 text-pink-400 border border-pink-500/30' 
                        : 'bg-slate-700/50 text-slate-400 hover:bg-slate-700'
                    }`}
                  >
                    <ThumbsUp className="w-4 h-4" />
                    <span className="text-sm font-medium">6</span>
                  </button>
                  <button className="flex items-center gap-2 px-3 py-1.5 bg-slate-700/50 hover:bg-slate-700 text-slate-400 rounded-lg transition-colors">
                    <MessageCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">8</span>
                  </button>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column - Sidebar */}
          <div className="col-span-4 space-y-6">
            
            {/* Executive Highlights */}
            <div className="bg-slate-800/30 border border-slate-700/40 rounded-xl p-6 backdrop-blur-sm sticky top-24">
              <h3 className="text-lg font-roobert-semibold text-white mb-4">Executive Highlights</h3>
              <ul className="space-y-3 text-sm text-slate-300">
                <li className="flex gap-2">
                  <span className="text-cyan-400 mt-1">•</span>
                  <span>B2B buyers print on-insights of their journey & transport center digital buyers (engaging minimally sellers</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-cyan-400 mt-1">•</span>
                  <span>Best agencies stimulate vs content to not-on engaging source a digital-first.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-cyan-400 mt-1">•</span>
                  <span>Digital state-sheen GTM strategies can your important as elite sources</span>
                </li>
              </ul>
            </div>

            {/* Associated Resources */}
            <div className="bg-slate-800/30 border border-slate-700/40 rounded-xl p-6 backdrop-blur-sm">
              <h3 className="text-lg font-roobert-semibold text-white mb-4">Associated Resources</h3>
              
              <div className="space-y-3">
                {/* Resource 1 */}
                <div className="bg-slate-700/30 border border-slate-600/30 rounded-lg p-4 hover:bg-slate-700/50 transition-colors cursor-pointer">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <BookOpen className="w-5 h-5 text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-slate-400 mb-1">Gartner</div>
                      <div className="text-sm font-roobert-semibold text-white mb-1">
                        B2B Digital Buyers Guide
                      </div>
                      <p className="text-xs text-slate-400 mb-2">
                        Real answer, further intelligible comprehensive derived main source signing indirectly digital which state strategies.
                      </p>
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1 text-slate-400">
                          <User className="w-3 h-3" />
                          <span>Original analyst</span>
                        </div>
                        <div className="flex items-center gap-1 text-blue-400">
                          <Clock className="w-3 h-3" />
                          <span>5 years ago</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Resource 2 */}
                <div className="bg-slate-700/30 border border-slate-600/30 rounded-lg p-4 hover:bg-slate-700/50 transition-colors cursor-pointer">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <TrendingUp className="w-5 h-5 text-purple-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-slate-400 mb-1">Rex</div>
                      <div className="text-sm font-roobert-semibold text-white mb-1">
                        Driving Pipeline with Demo Automation
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
                        <span>Q4: Purchase gap</span>
                        <span>•</span>
                        <span>$800M</span>
                      </div>
                      <p className="text-xs text-slate-400">
                        Engravter present demon automating no driven 80 commands perspective finance on E Ration GTM.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Read More */}
            <div className="bg-slate-800/30 border border-slate-700/40 rounded-xl p-4 backdrop-blur-sm">
              <a href="#" className="text-sm text-cyan-400 hover:text-cyan-300 flex items-center gap-2">
                <span>Read more more Articles</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {/* History */}
            <div className="bg-slate-800/30 border border-slate-700/40 rounded-xl p-6 backdrop-blur-sm">
              <h3 className="text-lg font-roobert-semibold text-white mb-4">History</h3>
              
              <div className="space-y-4">
                {/* History Item 1 */}
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                    CD
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-roobert-medium text-white">Claire Davidson</span>
                      <span className="text-xs text-slate-400">7 years ago</span>
                    </div>
                    <div className="text-xs text-slate-400">Tag organization marked</div>
                  </div>
                </div>

                {/* History Item 2 */}
                <div className="pl-11 space-y-2">
                  <div className="text-xs text-slate-400">
                    <div className="flex items-center gap-2 mb-1">
                      <FileText className="w-3 h-3" />
                      <span>DevelEnance • 5 mins ago</span>
                    </div>
                    <div className="flex items-center gap-2 mb-1">
                      <Edit3 className="w-3 h-3" />
                      <span>Published • 3 months ago</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3 h-3" />
                      <span>Updated • 3 months ago</span>
                    </div>
                  </div>
                </div>

                {/* Timeline Entry */}
                <div className="border-t border-slate-700/40 pt-3">
                  <div className="text-xs text-slate-400 mb-2">
                    <Clock className="w-3 h-3 inline mr-1" />
                    <span>3 mins post nth workflow since March</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-2">
                  <select className="flex-1 px-3 py-1.5 bg-slate-700/50 border border-slate-600/30 rounded text-xs text-slate-300">
                    <option>Major</option>
                  </select>
                  <button className="p-1.5 bg-slate-700/50 hover:bg-slate-700 rounded transition-colors">
                    <Share2 className="w-3 h-3 text-slate-400" />
                  </button>
                  <button className="p-1.5 bg-slate-700/50 hover:bg-slate-700 rounded transition-colors">
                    <Users className="w-3 h-3 text-slate-400" />
                  </button>
                  <button className="p-1.5 bg-slate-700/50 hover:bg-slate-700 rounded transition-colors">
                    <MessageCircle className="w-3 h-3 text-slate-400" />
                  </button>
                </div>
              </div>
            </div>

            {/* Second History Section */}
            <div className="bg-slate-800/30 border border-slate-700/40 rounded-xl p-6 backdrop-blur-sm">
              <h3 className="text-lg font-roobert-semibold text-white mb-4">History</h3>
              
              <div className="space-y-3">
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                    CD
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-roobert-medium text-white mb-1">Claire Davidson</div>
                    <div className="space-y-1 text-xs text-slate-400">
                      <div className="flex items-center gap-2">
                        <Edit3 className="w-3 h-3" />
                        <span>Draft versed 3 mins ago</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3 h-3" />
                        <span>Published 3 months ago</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-3 h-3" />
                        <span>Uploaded 1 month ago</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button className="p-1 hover:bg-slate-700/50 rounded transition-colors">
                      <ChevronLeft className="w-3 h-3 text-slate-400" />
                    </button>
                    <button className="p-1 hover:bg-slate-700/50 rounded transition-colors">
                      <ChevronLeft className="w-3 h-3 text-slate-400 rotate-180" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}

// Missing BarChart3 icon - adding inline
const BarChart3 = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M3 3v18h18"/>
    <path d="M18 17V9"/>
    <path d="M13 17V5"/>
    <path d="M8 17v-3"/>
  </svg>
);
