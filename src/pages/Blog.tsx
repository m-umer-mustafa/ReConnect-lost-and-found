import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface BlogPost {
  id: number;
  title: string;
  date: string;
  category: string;
  excerpt: string;
  content: string;
  author: string;
}

const blogPosts: BlogPost[] = [
  {
    id: 1,
    title: "The Psychology of Lost and Found: Why We Lose Things",
    date: "February 10, 2026",
    category: "Insights",
    author: "ReConnect Team",
    excerpt: "Understanding the cognitive science behind losing items can help us prevent future losses and develop better organizational habits.",
    content: `Losing personal belongings is a universal human experience that transcends age, profession, and lifestyle. From misplaced keys to forgotten bags, the phenomenon of lost items is deeply rooted in how our brains process and prioritize information.

Research in cognitive psychology reveals that we lose things primarily due to attention lapses and memory failures. When our minds are preoccupied with multiple tasks, we operate on "autopilot," performing routine actions without conscious awareness. This is why we might place our phone in an unusual spot while distracted and have no memory of doing so.

The concept of "retrieval failure" explains why we sometimes can't remember where we put something. Our brains encode memories based on context, so when that context changes, accessing the memory becomes difficult. This is why retracing your steps often works – you're recreating the context in which the memory was formed.

Environmental factors play a significant role too. Cluttered spaces increase the likelihood of misplacing items because visual complexity makes it harder for our brains to form distinct spatial memories. Similarly, stress and fatigue impair our working memory, making us more prone to losing track of our belongings.

Understanding these mechanisms can help us develop strategies to prevent losses: maintaining organized spaces, developing consistent routines for important items, and being mindful during transitions between locations. The ReConnect platform leverages these insights by providing a systematic way to report and recover lost items, turning a frustrating experience into a manageable one.`
  },
  {
    id: 2,
    title: "Building a Stronger Community Through Lost and Found",
    date: "February 8, 2026",
    category: "Community",
    author: "ReConnect Team",
    excerpt: "Discover how returning lost items creates connections and strengthens community bonds in unexpected ways.",
    content: `The act of returning a lost item to its rightful owner might seem like a simple gesture, but it represents something much more profound – it's an expression of community care and mutual respect that strengthens the social fabric of our institutions.

When someone takes the time to report a found item or help reunite it with its owner, they're demonstrating a commitment to the collective well-being. These small acts of kindness create ripple effects throughout a community. The person who lost the item experiences relief and gratitude, while the finder feels the satisfaction of helping others. Witnesses to these interactions are reminded that people can be trusted and that their community is a place where people look out for one another.

Research on prosocial behavior shows that communities with higher rates of helping behaviors – like returning lost items – tend to have stronger social cohesion, lower crime rates, and higher overall satisfaction among residents. These acts serve as visible proof that community members care about each other's welfare.

Universities and organizations that implement effective lost and found systems aren't just helping people recover their belongings; they're creating infrastructure for kindness. They're making it easier for people to do the right thing, and in doing so, they're cultivating a culture of responsibility and care.

ReConnect was designed with this understanding in mind. By making it simple and rewarding to report both lost and found items, we're not just facilitating the return of property – we're building pathways for community members to help each other. Every successful reunion is a reminder that we're part of something larger than ourselves, a community that values each member's well-being.`
  },
  {
    id: 3,
    title: "Technology Meets Tradition: The Evolution of Lost and Found",
    date: "February 5, 2026",
    category: "Technology",
    author: "ReConnect Team",
    excerpt: "From lost and found boxes to digital platforms – how technology is revolutionizing the way we recover lost items.",
    content: `The concept of lost and found is as old as human civilization itself, but the methods we use to reunite people with their belongings have evolved dramatically, especially in the digital age.

Traditional lost and found systems relied on physical storage locations and manual record-keeping. Someone would turn in a found item to a central office, where it would be logged in a paper ledger and stored in a box or cabinet. The owner would have to physically visit the location, describe their item, and hope it had been turned in. This system was simple but had significant limitations: limited accessibility, poor searchability, slow matching processes, and no way to notify owners when their items were found.

The digital revolution has transformed this landscape. Modern lost and found platforms like ReConnect leverage technology to address these traditional pain points. Digital databases make items searchable by multiple criteria – category, location, date, color, and distinctive features. Automated matching algorithms can suggest potential matches between lost and found reports. Email and push notifications alert users when potential matches are found. Photo documentation provides visual verification before claim attempts.

What makes ReConnect particularly innovative is its integration of community-driven features. Users can browse found items even if they haven't reported something lost, creating more opportunities for reunification. The platform's visual interface makes it easier to identify items compared to text-only descriptions. Real-time updates ensure that information is current and relevant.

Looking ahead, emerging technologies promise even more capabilities: AI-powered image recognition could automatically match found items to lost reports based on photos. Blockchain technology could create immutable proof of ownership for high-value items. IoT integration with lost item trackers could automatically generate lost reports when items leave designated areas. Machine learning could predict likely locations where lost items might be found based on historical patterns.

Yet for all this technological sophistication, the heart of lost and found remains unchanged: it's about people helping people. Technology is simply the tool that makes this helping easier, faster, and more effective.`
  },
  {
    id: 4,
    title: "Best Practices for Reporting and Claiming Lost Items",
    date: "February 1, 2026",
    category: "Tips & Guides",
    author: "ReConnect Team",
    excerpt: "Maximize your chances of recovering lost items with these proven strategies for effective reporting and claiming.",
    content: `Whether you've lost something valuable or found an item that belongs to someone else, following best practices can significantly increase the chances of a successful reunion. Here's what you need to know.

**When Reporting a Lost Item:**

*Be specific and detailed.* The more information you provide, the easier it is to match your report with found items. Include: exact description of the item (brand, model, color, size), distinctive features or markings (scratches, stickers, custom modifications), last known location and approximate time, circumstances of the loss.

*Report quickly.* The sooner you file a report, the fresher the details in your memory and the more likely someone who found it will remember it. Many found items are turned in within the first 24-48 hours of being lost.

*Include photos if possible.* Visual documentation is invaluable, especially for items with unique characteristics. If you don't have a photo of the specific item, find an image online of a similar one and note the differences.

*Check regularly.* Don't just file a report and wait. Check the found items database frequently, as new items are reported daily. Set up notifications if the platform offers them.

*Expand your search.* Sometimes items are found in unexpected places. Check adjacent locations, earlier and later time periods, and similar categories.

**When Reporting a Found Item:**

*Report it promptly.* The owner is likely searching for their item right now. The faster you report it, the sooner they can be reunited with it.

*Document thoroughly.* Take clear photos from multiple angles. Note exactly where and when you found it. Look for any identifying information like names, initials, or unique features.

*Handle with care.* Treat found items as if they were your own valuables. Store them securely until they can be returned.

*Protect privacy.* Don't share sensitive information publicly. If you find a wallet with ID, for example, report it to authorities or through secure platforms rather than posting details on social media.

**Verification and Safety:**

When claiming an item, be prepared to verify ownership through specific details that wouldn't be visible in photos or general descriptions. Consider meeting in public, well-lit locations for exchanges. If the item has significant value, consider involving campus security or administration.

ReConnect's platform is designed around these best practices, with features that guide users through proper reporting and claiming procedures while maintaining security and privacy.`
  },
  {
    id: 5,
    title: "The Environmental Impact of Lost Items",
    date: "January 28, 2026",
    category: "Sustainability",
    author: "ReConnect Team",
    excerpt: "How effective lost and found systems contribute to sustainability and reduce waste in our communities.",
    content: `In discussions about environmental sustainability, lost and found systems rarely come up. Yet they play a significant role in reducing waste and promoting more sustainable consumption patterns.

**The Scale of the Problem**

Consider these statistics: Americans lose or misplace their phones an average of 2-3 times per year. College students collectively lose thousands of items each semester, from textbooks to electronics to clothing. A significant portion of lost items is never reclaimed and eventually ends up in landfills.

The environmental cost of replacing these items is substantial. Manufacturing a smartphone requires mining rare earth elements, extensive energy consumption, and generates significant carbon emissions. A laptop's production involves complex global supply chains and resource extraction. Even seemingly simple items like water bottles or umbrellas require resources to produce and generate waste when discarded.

**Lost and Found as Waste Prevention**

Effective lost and found systems serve as a crucial intervention in this cycle. When a lost item is successfully returned to its owner: no replacement purchase is necessary, preventing the environmental impact of manufacturing a new item. The existing item continues its useful life rather than becoming premature waste. Resources that would have gone into production and disposal are conserved.

In this way, every successful lost-and-found reunion is an act of environmental conservation. It's waste prevention at its most direct – keeping functional items in use rather than in landfills.

**Beyond Individual Items**

The impact extends beyond individual reunions. Communities with strong lost and found systems develop different relationships with their possessions. People feel more secure bringing valuable items to shared spaces, knowing there's a good chance of recovery if lost. This security can reduce the tendency to buy cheaper, disposable alternatives. The visibility of found items serves as a reminder to be more mindful with belongings.

**A Culture of Care**

Effective lost and found systems also promote a culture of care that extends to environmental consciousness. When community members actively help each other recover lost items, they demonstrate values of resourcefulness and mutual support. These same values underpin sustainable practices like sharing, repairing, and reusing rather than disposing and replacing.

ReConnect was designed not just to reunite people with their belongings, but to strengthen this culture of care. Every item successfully returned is one less item in a landfill, one less resource extracted, one less product manufactured. It's a small but meaningful contribution to environmental sustainability, multiplied across thousands of transactions.

In an era of climate crisis and resource scarcity, we need to value and preserve the items we already have. Lost and found systems are one practical, immediate way to do exactly that.`
  }
];

export const Blog: React.FC = () => {
  const [selectedPost, setSelectedPost] = React.useState<BlogPost | null>(null);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 lg:py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold gradient-text mb-4">
            ReConnect Blog
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Insights, stories, and tips about lost and found in the digital age
          </p>
        </div>

        {selectedPost ? (
          /* Full Blog Post View */
          <div className="max-w-4xl mx-auto">
            <button
              onClick={() => setSelectedPost(null)}
              className="flex items-center text-primary hover:underline mb-6 group"
            >
              <svg
                className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back to all posts
            </button>

            <article className="bg-card rounded-lg border p-6 md:p-10">
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <Badge variant="secondary">{selectedPost.category}</Badge>
                <span className="text-sm text-muted-foreground">•</span>
                <span className="text-sm text-muted-foreground">{selectedPost.date}</span>
              </div>

              <h1 className="text-3xl md:text-4xl font-bold mb-4">
                {selectedPost.title}
              </h1>

              <div className="flex items-center gap-2 mb-8 text-sm text-muted-foreground">
                <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center">
                  <span className="text-white text-xs font-bold">R</span>
                </div>
                <span>By {selectedPost.author}</span>
              </div>

              <div className="prose prose-slate dark:prose-invert max-w-none">
                {selectedPost.content.split('\n\n').map((paragraph, index) => {
                  // Check if paragraph is a heading (starts with **)
                  if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
                    return (
                      <h2 key={index} className="text-2xl font-bold mt-8 mb-4">
                        {paragraph.slice(2, -2)}
                      </h2>
                    );
                  }
                  // Check if paragraph is a subheading (starts with *)
                  if (paragraph.startsWith('*') && paragraph.endsWith('*') && !paragraph.includes('**')) {
                    return (
                      <h3 key={index} className="text-xl font-semibold mt-6 mb-3">
                        {paragraph.slice(1, -1)}
                      </h3>
                    );
                  }
                  return (
                    <p key={index} className="mb-4 text-base leading-relaxed">
                      {paragraph}
                    </p>
                  );
                })}
              </div>
            </article>
          </div>
        ) : (
          /* Blog Post Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogPosts.map((post) => (
              <Card
                key={post.id}
                className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1 flex flex-col"
                onClick={() => setSelectedPost(post)}
              >
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="secondary">{post.category}</Badge>
                    <span className="text-sm text-muted-foreground">{post.date}</span>
                  </div>
                  <CardTitle className="text-xl leading-tight hover:text-primary transition-colors">
                    {post.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-between">
                  <CardDescription className="text-sm line-clamp-3 mb-4">
                    {post.excerpt}
                  </CardDescription>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="w-6 h-6 rounded-full bg-gradient-primary flex items-center justify-center">
                      <span className="text-white text-xs font-bold">R</span>
                    </div>
                    <span>{post.author}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
