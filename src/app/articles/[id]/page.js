import { CalendarDays, Clock, User, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

// Articles data - only user-provided articles
const articles = [
  {
    id: 1,
    title: "How to Install a Solar System in Your Home in Pakistan",
    excerpt: "A comprehensive step-by-step guide to installing solar panels in Pakistan, including costs, system types, and professional installation services.",
    author: "Solar Lgao Team",
    date: "2025-04-15",
    readTime: "8 min read",
    category: "Solar Energy",
    content: `<p class="text-lg text-muted-foreground leading-relaxed mb-6">
        Would you want to think about having a solar system installed at home in Pakistan? As electricity prices rise and more people learn about renewable energy, the decision to turn to solar powering is proving increasingly wise to homeowners. This simple step by step guide will take through the entire process grid-connected solar panel system with a step-by-step guide, how to calculate price of solar panel in Pakistan, solar inverter price in Pakistan and other expense.
      </p>

      <h2 class="font-serif text-2xl font-bold text-foreground mb-4">Why should you own a Solar System in Pakistan?</h2>
      <p class="text-muted-foreground leading-relaxed mb-6">
        Solar energy presents very good opportunities of clean and cheap electricity since Pakistan experiences a lot of sunshine during the year. Installation of a solar panel will cut you off with the national grid usage, decrease the monthly amount of electricity spent on bills, and allow creating a more favorable environment.
      </p>

      <h2 class="font-serif text-2xl font-bold text-foreground mb-4">Step 1: How many energy do you need?</h2>
      <p class="text-muted-foreground leading-relaxed mb-6">
        Do an average of your electricity usage (in kilowatt-hours or kWh) before buying the solar system. Take your previous electricity bills and find out your level of energy consumption every month. This will assist in deciding the size of the solar system requirements you will require that will directly influence the price of the solar panel and the total cost of the system.
      </p>

      <h2 class="font-serif text-2xl font-bold text-foreground mb-4">Step 2: Roof inspection to install solar panels</h2>
      <p class="text-muted-foreground leading-relaxed mb-4">
        An efficient roof structure is needed to use in the installation of solar panels. Look for:
      </p>
      <ul class="list-disc list-inside text-muted-foreground mb-6 space-y-2">
        <li>A sound healthy and good roof frame</li>
        <li>South oriented and least shade is required</li>
        <li>15 to 40 degree roof tilt that works well in the Pakistan sun exposure pattern</li>
      </ul>
      <p class="text-muted-foreground leading-relaxed mb-6">
        When your roof fails against these standards, then there is ground-mounted system that can be an alternative.
      </p>

      <h2 class="font-serif text-2xl font-bold text-foreground mb-4">Step 3: Considering the Appropriate Type of Solar System</h2>
      <p class="text-muted-foreground leading-relaxed mb-6">
        Three solar systems are to be considered:
      </p>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div class="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-lg p-6">
          <h3 class="font-semibold text-foreground text-lg mb-2">Grid-Tied Solar System</h3>
          <p class="text-sm text-muted-foreground">Connected to utility grid system; allows net metering and cheaper to supply.</p>
        </div>
        <div class="bg-gradient-to-br from-secondary/10 to-secondary/5 border border-secondary/20 rounded-lg p-6">
          <h3 class="font-semibold text-foreground text-lg mb-2">Off-Grid Solar System</h3>
          <p class="text-sm text-muted-foreground">Off-grid, battery based system; an off-grid stand-alone system with no grid connection.</p>
        </div>
        <div class="bg-gradient-to-br from-accent/10 to-accent/5 border border-accent/20 rounded-lg p-6">
          <h3 class="font-semibold text-foreground text-lg mb-2">Hybrid Solar System</h3>
          <p class="text-sm text-muted-foreground">Requires both grid connection and battery backup that will utilize a hybrid solar system to as far as it is a reliable system.</p>
        </div>
      </div>
      <p class="text-muted-foreground leading-relaxed mb-6">
        The most common homeowner systems applied in Pakistan are grid-tied or hybrid that is subject to affordability and energy requirements.
      </p>

      <h2 class="font-serif text-2xl font-bold text-foreground mb-4">Step 4: Get to know the prices of Solar Panel and Inverter in Pakistan</h2>
      <p class="text-muted-foreground leading-relaxed mb-6">
        In Pakistan, the price of solar panel varies with the quality and type of the panels:
      </p>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div class="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-lg p-6">
          <h3 class="font-semibold text-foreground text-lg mb-2">Monocrystalline solar cells</h3>
          <p class="text-sm text-muted-foreground mb-3">Require even higher costs, but are more efficient</p>
          <div class="text-2xl font-bold text-primary">Premium</div>
        </div>
        <div class="bg-gradient-to-br from-secondary/10 to-secondary/5 border border-secondary/20 rounded-lg p-6">
          <h3 class="font-semibold text-foreground text-lg mb-2">Polycrystalline solar panels</h3>
          <p class="text-sm text-muted-foreground mb-3">Less efficient, cheaper</p>
          <div class="text-2xl font-bold text-secondary">Budget</div>
        </div>
      </div>
      <div class="bg-accent/10 border border-accent/20 rounded-lg p-6 mb-6">
        <p class="text-muted-foreground mb-3">
          <strong>Solar Panels:</strong> You will spend roughly between PKR 35,000 and PKR 50,000 per kilowatt of solar-powered panels.
        </p>
        <p class="text-muted-foreground">
          <strong>Solar Inverter:</strong> The inverter price in Pakistan is between PKR 15,000 and PKR 30,000 depending on the capacity and brand. An inverter converts DC electricity generated in the solar panels to AC electricity which can be supplied to your house.
        </p>
      </div>

      <h2 class="font-serif text-2xl font-bold text-foreground mb-4">Step 5: Approval / permissions</h2>
      <p class="text-muted-foreground leading-relaxed mb-6">
        It is important to consider permission with the local officials or with your power company prior to the installation to be done. This makes sure that your solar setup is used is by the book and will meet net metering standards (when grid-tied).
      </p>

      <h2 class="font-serif text-2xl font-bold text-foreground mb-4">Step 6: Installation procedure of Solar Panels</h2>
      <p class="text-muted-foreground leading-relaxed mb-6">
        There are professional fitters who will:
      </p>
      <ul class="list-disc list-inside text-muted-foreground mb-6 space-y-2">
        <li>Install solar panels by means of your roof or platform on the ground</li>
        <li>Hook solar inverter on connecting panels and electric system of your home</li>
        <li>In case you have an off-grid or a hybrid system, you should install batteries</li>
        <li>Safety and performance check on the system</li>
      </ul>
      <p class="text-muted-foreground leading-relaxed mb-6">
        Seeking the services of skilled operators by hiring professionals in the installation of solar will ensure efficiency, safety and adherence.
      </p>

      <h2 class="font-serif text-2xl font-bold text-foreground mb-4">Step 7: Ensure you maintain your Solar System to be E-efficient Long-term</h2>
      <p class="text-muted-foreground leading-relaxed mb-6">
        To have your solar system running smoothly, merely years following, maintain it with frequent solar panel cleaning (removal of dust and debris) and your system check ups. The cost of maintenance is as a rule low as compared to the saving you incur.
      </p>

      <h2 class="font-serif text-2xl font-bold text-foreground mb-4">Projected Installation Cost of a Solar System on Home in Pakistan</h2>
      <div class="overflow-x-auto mb-6">
        <table class="w-full border-collapse">
          <thead>
            <tr class="border-b border-border">
              <th class="text-left py-4 px-6 font-semibold text-foreground">Component</th>
              <th class="text-left py-4 px-6 font-semibold text-foreground">Price Range (PKR)</th>
            </tr>
          </thead>
          <tbody>
            <tr class="border-b border-border/50">
              <td class="py-4 px-6 text-foreground">Solar Panels (per kW)</td>
              <td class="py-4 px-6 font-semibold text-primary">35,000 to 50,000</td>
            </tr>
            <tr class="border-b border-border/50 bg-muted/30">
              <td class="py-4 px-6 text-foreground">Solar Inverter</td>
              <td class="py-4 px-6 font-semibold text-primary">15,000 - 30,000</td>
            </tr>
            <tr class="border-b border-border/50">
              <td class="py-4 px-6 text-foreground">Mounting and Wiring</td>
              <td class="py-4 px-6 font-semibold text-primary">10,000 - 15,000</td>
            </tr>
            <tr class="border-b border-border/50 bg-muted/30">
              <td class="py-4 px-6 text-foreground">Battery (Optional)</td>
              <td class="py-4 px-6 font-semibold text-primary">20,000 - 50,000</td>
            </tr>
            <tr>
              <td class="py-4 px-6 text-foreground">Cost of Installing</td>
              <td class="py-4 px-6 font-semibold text-primary">10,000 - 20,000</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p class="text-sm text-muted-foreground mb-6 text-center">
        The prices depend upon the size of systems, quality and suppliers.
      </p>

      <h2 class="font-serif text-2xl font-bold text-foreground mb-4">What makes you pick Solar Lgao to install your solar system?</h2>
      <p class="text-muted-foreground leading-relaxed mb-6">
        Solar Lgao is a solar panel installation company that also provides high-quality services to customers throughout Pakistan. We offer professional guidance, clarity on terms of both costs and benefits of the solar panels, inverters and entire solar systems depending on the energy requirements.
      </p>

      <div class="bg-primary/10 border border-primary/20 rounded-lg p-6 text-center">
        <p class="text-lg font-semibold text-primary mb-2">Ready to Get Started?</p>
        <p class="text-muted-foreground mb-4">Ask us today! Get a free quote and step on the path to a cheap, environment friendly solar energy!</p>
        <a href="/quote" class="inline-flex items-center justify-center px-6 py-3 bg-green-500 text-white font-medium rounded-lg hover:bg-green-600 transition-colors">
          Get Free Quote
        </a>
      </div>
    `
  },
  {
    id: 2,
    title: "How to Determine the Size and Cost of Your Solar System in Pakistan: The Complete Guide",
    excerpt: "Learn how to size your solar system and estimate costs in Pakistan: step-by-step calculations, 2025 panel and inverter prices, and a real 3.5 kW example.",
    author: "Solar Lgao Team",
    date: "2025-04-16",
    readTime: "9 min read",
    category: "Solar Energy",
    content: ` <div class="bg-card border border-border rounded-xl p-8 shadow-sm mb-6">
        <p class="text-lg text-muted-foreground leading-relaxed">
          The use of solar energy is increasingly turning out to be one of the most brilliant choices amongst homeowners and businesses in Pakistan. As electricity prices rise and power failures increase, installing a solar system is no longer a luxury—it’s a necessity. This guide shows you how to calculate the correct system size and estimate total cost using current solar panel and inverter prices in Pakistan (2025).
        </p>
        <p class="text-muted-foreground leading-relaxed mt-4">
          We at <strong>SOLAR LGAO</strong> provide accurate information so you can make an informed choice and save significantly on your electricity bills.
        </p>
      </div>

      <div class="bg-gradient-to-br from-primary/5 to-secondary/5 border border-border rounded-xl p-8 shadow-sm mb-8">
        <h2 class="font-serif text-3xl font-bold text-foreground mb-4">Step 1: Be Aware of How Much Electricity You Use</h2>
        <p class="text-muted-foreground leading-relaxed mb-2">Check your electricity bill for monthly usage in kilowatt-hours (kWh).</p>
        <div class="bg-accent/10 border border-accent/20 rounded-lg p-4">
          <p class="text-sm text-muted-foreground"><strong>Scenario:</strong> If your bill shows <strong>500 kWh</strong>, that’s your monthly consumption.</p>
        </div>
      </div>

      <div class="bg-card border border-border rounded-xl p-8 shadow-sm mb-8">
        <h2 class="font-serif text-3xl font-bold text-foreground mb-4">Step 2: Discover Your Daily Energy Need</h2>
        <p class="text-muted-foreground leading-relaxed mb-4">Solar system sizing is based on daily usage.</p>
        <div class="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-3">
          <p class="text-sm text-foreground"><strong>Formula:</strong> Daily Usage (kWh/day) = Monthly Usage (kWh) ÷ 30</p>
        </div>
        <div class="bg-accent/10 border border-accent/20 rounded-lg p-4">
          <p class="text-sm text-foreground"><strong>Example:</strong> 500 ÷ 30 = <strong>16.6 kWh/day</strong></p>
        </div>
      </div>

      <div class="bg-card border border-border rounded-xl p-8 shadow-sm mb-8">
        <h2 class="font-serif text-3xl font-bold text-foreground mb-4">Step 3: Compute Solar System Size</h2>
        <p class="text-muted-foreground leading-relaxed mb-4">Pakistan averages <strong>5–6</strong> peak sunlight hours per day (use 5.5 for sizing).</p>
        <div class="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-3">
          <p class="text-sm text-foreground"><strong>Formula:</strong> System Size (kW) = Daily Usage (kWh/day) ÷ Sunlight Hours</p>
        </div>
        <div class="bg-accent/10 border border-accent/20 rounded-lg p-4 mb-3">
          <p class="text-sm text-foreground"><strong>Example:</strong> 16.6 ÷ 5.5 = <strong>3.02 kW</strong> → round to <strong>3.5 kW</strong> for headroom.</p>
        </div>
        <p class="text-muted-foreground">A <strong>3.5 kW</strong> solar system will meet this usage with margin for future demand.</p>
      </div>

      <div class="bg-card border border-border rounded-xl p-8 shadow-sm mb-8">
        <h2 class="font-serif text-3xl font-bold text-foreground mb-4">Step 4: Solar Panel Price in Pakistan (2025)</h2>
        <ul class="list-disc list-inside text-muted-foreground space-y-2 mb-4">
          <li><strong>Panel price:</strong> PKR <strong>40–70/watt</strong> (brand, wattage, efficiency)</li>
          <li><strong>550W panel:</strong> PKR <strong>22,000–38,000</strong></li>
          <li><strong>For 3.5 kW:</strong> approx. <strong>6–7 panels</strong> (depending on wattage)</li>
        </ul>
      </div>

      <div class="bg-card border border-border rounded-xl p-8 shadow-sm mb-8">
        <h2 class="font-serif text-3xl font-bold text-foreground mb-4">Step 5: Solar Inverter Price in Pakistan</h2>
        <p class="text-muted-foreground leading-relaxed mb-3">An inverter converts DC from panels to AC for your home.</p>
        <div class="bg-accent/10 border border-accent/20 rounded-lg p-4">
          <p class="text-sm text-foreground"><strong>3–5 kW inverter:</strong> PKR <strong>80,000–180,000</strong> (Growatt, Huawei, Inverex are popular)</p>
        </div>
      </div>

      <div class="bg-card border border-border rounded-xl p-8 shadow-sm mb-8">
        <h2 class="font-serif text-3xl font-bold text-foreground mb-4">Step 6: Installation and Other Costs</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="bg-primary/10 border border-primary/20 rounded-lg p-4 text-center">
            <p class="font-semibold text-foreground">Mounting Structures</p>
            <p class="text-sm text-muted-foreground">PKR 15,000–30,000</p>
          </div>
          <div class="bg-secondary/10 border border-secondary/20 rounded-lg p-4 text-center">
            <p class="font-semibold text-foreground">Breakers & Wiring</p>
            <p class="text-sm text-muted-foreground">PKR 20,000–40,000</p>
          </div>
          <div class="bg-accent/10 border border-accent/20 rounded-lg p-4 text-center">
            <p class="font-semibold text-foreground">Net Metering (optional)</p>
            <p class="text-sm text-muted-foreground">PKR 25,000–50,000</p>
          </div>
        </div>
      </div>

      <div class="bg-card border border-border rounded-xl p-8 shadow-sm mb-8">
        <h2 class="font-serif text-3xl font-bold text-foreground mb-4">Step 7: Example Cost Breakdown (3.5 kW)</h2>
        <div class="overflow-x-auto">
          <table class="w-full border-collapse">
            <thead>
              <tr class="border-b border-border">
                <th class="text-left py-4 px-6 font-semibold text-foreground">Components</th>
                <th class="text-left py-4 px-6 font-semibold text-foreground">Estimated cost (PKR)</th>
              </tr>
            </thead>
            <tbody>
              <tr class="border-b border-border/50">
                <td class="py-4 px-6 text-foreground">Solar Panels (3,500W @ 50/watt)</td>
                <td class="py-4 px-6 font-semibold text-primary">175,000</td>
              </tr>
              <tr class="border-b border-border/50 bg-muted/30">
                <td class="py-4 px-6 text-foreground">Solar Inverter</td>
                <td class="py-4 px-6 font-semibold text-primary">120,000</td>
              </tr>
              <tr class="border-b border-border/50">
                <td class="py-4 px-6 text-foreground">Mounts & Accessories</td>
                <td class="py-4 px-6 font-semibold text-primary">50,000</td>
              </tr>
              <tr>
                <td class="py-4 px-6 text-foreground font-semibold">Total Estimated Cost</td>
                <td class="py-4 px-6 font-semibold text-primary">345,000</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="bg-card border border-border rounded-xl p-8 shadow-sm mb-8">
        <h2 class="font-serif text-3xl font-bold text-foreground mb-4">Step 8: Calculate the Savings</h2>
        <p class="text-muted-foreground leading-relaxed mb-3">If your monthly bill is <strong>PKR 18,000</strong>, a 3.5 kW system can save about <strong>PKR 216,000/year</strong>.</p>
        <div class="bg-primary/10 border border-primary/20 rounded-lg p-4">
          <p class="text-sm text-foreground"><strong>Payback:</strong> ≈ <strong>1.6 years</strong>. Afterwards, enjoy over 20 years of low-cost, clean energy.</p>
        </div>
      </div>

      <div class="bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20 rounded-xl p-8 shadow-sm mb-6">
        <h2 class="font-serif text-3xl font-bold text-foreground mb-4">Final Words from SOLAR LGAO</h2>
        <ul class="list-disc list-inside text-muted-foreground space-y-2 mb-6">
          <li>Compare solar panel prices from multiple suppliers.</li>
          <li>Choose <strong>Tier-1</strong> solar panels for efficiency and reliability.</li>
          <li>Invest in a quality inverter to maximize power output.</li>
          <li>Plan for future energy demand to avoid costly upgrades.</li>
        </ul>
        <div class="bg-primary/10 border border-primary/20 rounded-lg p-6 text-center">
          <p class="text-lg font-semibold text-primary mb-2">Ready to Size Your System?</p>
          <p class="text-muted-foreground mb-4">SOLAR LGAO helps you select the best panels, inverters, and configuration to save costs and live sustainably.</p>
          <a href="/quote" class="inline-flex items-center justify-center px-6 py-3 bg-green-500 text-white font-medium rounded-lg hover:bg-green-600 transition-colors">Get a Free Quote</a>
        </div>
      </div>
    `
  },
  {
    id: 3,
    title: "Getting the Best out of your Solar System: Ways to make it as benefit-taking as possible with regard to longevity.",
    excerpt: "Practical maintenance tips to maximize your solar system's efficiency and lifespan in Pakistan—cleaning, inspections, inverter care, shading prevention, battery upkeep, and monitoring.",
    author: "Solar Lgao Team",
    date: "2025-04-17",
    readTime: "7 min read",
    category: "Solar Energy",
    content: ` <div class="bg-card border border-border rounded-xl p-8 shadow-sm mb-6">
        <p class="text-lg text-muted-foreground leading-relaxed">
          There is no better option to invest in cheaper electricity cost and adopt renewable energy in Pakistan than to invest in a solar system. However, like any long-term investment, proper maintenance and attention are essential. A well-maintained solar system can operate at maximum efficiency for <strong>20–25 years</strong> or more—delivering the best return on your investment.
        </p>
        <p class="text-muted-foreground leading-relaxed mt-4">
          These are some easy ways to ensure that your <strong>solar panels</strong>, <strong>solar plates</strong>, and <strong>solar inverters</strong> operate efficiently and last longer.
        </p>
      </div>

      <div class="bg-gradient-to-br from-primary/5 to-secondary/5 border border-border rounded-xl p-8 shadow-sm mb-6">
        <h2 class="font-serif text-2xl md:text-3xl font-bold text-foreground mb-4">1) Keep Solar Panels Clean</h2>
        <p class="text-muted-foreground leading-relaxed mb-4">Dust, diesel particulates, bird droppings, and urban pollution reduce sunlight reaching panels and lower performance.</p>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="bg-primary/10 border border-primary/20 rounded-lg p-4">
            <p class="text-sm text-foreground"><strong>How often:</strong> 1–2 times per month in cities; more often in dusty regions.</p>
          </div>
          <div class="bg-accent/10 border border-accent/20 rounded-lg p-4">
            <p class="text-sm text-foreground"><strong>How to clean:</strong> Use clean water and a soft brush or microfiber cloth. Avoid harsh chemicals or abrasive tools.</p>
          </div>
        </div>
      </div>

      <div class="bg-card border border-border rounded-xl p-8 shadow-sm mb-6">
        <h2 class="font-serif text-2xl md:text-3xl font-bold text-foreground mb-4">2) Inspect for Physical Damage</h2>
        <p class="text-muted-foreground leading-relaxed mb-4">Bad weather, falling debris, or accidents can damage panels or mounting.</p>
        <ul class="list-disc list-inside text-muted-foreground space-y-2">
          <li>Check for <strong>cracks or chips</strong> on panels</li>
          <li>Look for <strong>bent or loose frames</strong> and mounting hardware</li>
          <li>Ensure <strong>wires and connections</strong> are secure and not frayed</li>
        </ul>
      </div>

      <div class="bg-card border border-border rounded-xl p-8 shadow-sm mb-6">
        <h2 class="font-serif text-2xl md:text-3xl font-bold text-foreground mb-4">3) Monitor Your Solar Inverter</h2>
        <p class="text-muted-foreground leading-relaxed mb-4">The inverter is the heart of your solar system—converting DC to AC power. Watch for warnings or odd behavior.</p>
        <ul class="list-disc list-inside text-muted-foreground space-y-2">
          <li>Warning messages or fault indicators</li>
          <li>Unusual clicking sounds or excessive heat</li>
          <li>Sudden drops in power generation</li>
        </ul>
        <p class="text-muted-foreground leading-relaxed">Schedule a <strong>yearly professional maintenance</strong> visit.</p>
      </div>

      <div class="bg-card border border-border rounded-xl p-8 shadow-sm mb-6">
        <h2 class="font-serif text-2xl md:text-3xl font-bold text-foreground mb-4">4) Prevent Shading</h2>
        <p class="text-muted-foreground leading-relaxed">Even small shadows can significantly reduce output. Trim trees and remove objects that cause shading around the panels.</p>
      </div>

      <div class="bg-card border border-border rounded-xl p-8 shadow-sm mb-6">
        <h2 class="font-serif text-2xl md:text-3xl font-bold text-foreground mb-4">5) Fix Loose or Wrong Connections</h2>
        <p class="text-muted-foreground leading-relaxed mb-4">Regular cleaning and visual checks help, but yearly professional inspections reveal deeper issues:</p>
        <ul class="list-disc list-inside text-muted-foreground space-y-2">
          <li>Rusting mounts or signs of corrosion</li>
          <li>Corroded connectors or water ingress</li>
          <li>Structural or installation shortcomings</li>
        </ul>
      </div>

      <div class="bg-card border border-border rounded-xl p-8 shadow-sm mb-6">
        <h2 class="font-serif text-2xl md:text-3xl font-bold text-foreground mb-4">6) Maintain Your Battery System (If Equipped)</h2>
        <ul class="list-disc list-inside text-muted-foreground space-y-2">
          <li>Store in a <strong>cool, dry, ventilated</strong> place</li>
          <li>Avoid <strong>frequent deep discharges</strong> to extend lifespan</li>
          <li>Keep terminals <strong>clean and tight</strong></li>
        </ul>
      </div>

      <div class="bg-card border border-border rounded-xl p-8 shadow-sm mb-6">
        <h2 class="font-serif text-2xl md:text-3xl font-bold text-foreground mb-4">7) Track System Output</h2>
        <p class="text-muted-foreground leading-relaxed">Use your inverter display or monitoring app to review daily and monthly production. Investigate sudden drops immediately.</p>
      </div>

      <div class="bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20 rounded-xl p-8 shadow-sm mb-6">
        <h2 class="font-serif text-2xl md:text-3xl font-bold text-foreground mb-4">Why Solar System Maintenance Matters</h2>
        <ul class="list-disc list-inside text-muted-foreground space-y-2">
          <li>Maximizes energy generation and <strong>increases savings</strong></li>
          <li>Early detection prevents <strong>costly repairs</strong></li>
          <li>Extends the lifespan of <strong>panels and inverters</strong></li>
          <li>Ensures reliable, year-round performance</li>
        </ul>
      </div>

      <div class="bg-card border border-border rounded-xl p-8 shadow-sm">
        <h2 class="font-serif text-2xl md:text-3xl font-bold text-foreground mb-4">Final Words</h2>
        <p class="text-muted-foreground leading-relaxed">
          Solar systems can provide decades of value—but only with proper care. By cleaning panels, inspecting for damage, monitoring the inverter, preventing shading, and scheduling regular professional servicing, you can enjoy <strong>low-cost, reliable electricity for years</strong>.
        </p>
      </div>
     `
  }
];

export default function ArticlePage({ params }) {
  const article = articles.find(a => a.id === parseInt(params.id));

  if (!article) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Article Not Found</h1>
          <Link href="/" className="text-primary hover:underline">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-primary hover:text-primary/80 font-medium transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Articles
          </Link>
        </div>

        {/* Article Header */}
        <section className="text-center py-16 bg-white dark:bg-gray-800 rounded-lg shadow-lg mb-8">
          <div className="max-w-4xl mx-auto px-4">
            <div className="mb-4">
              <span className="inline-block px-4 py-1 bg-green-200 text-green-800 dark:bg-green-700 dark:text-green-200 text-sm font-semibold rounded-full tracking-wide uppercase">
                {article.category}
              </span>
            </div>
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-extrabold text-foreground mb-6 leading-tight">
              {article.title}
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8 leading-relaxed">
              {article.excerpt}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center space-x-1">
                <User className="h-4 w-4 text-primary" />
                <span>{article.author}</span>
              </div>
              <span className="hidden sm:inline">•</span>
              <div className="flex items-center space-x-1">
                <CalendarDays className="h-4 w-4 text-primary" />
                <span>{new Date(article.date).toLocaleDateString()}</span>
              </div>
              <span className="hidden sm:inline">•</span>
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4 text-primary" />
                <span>{article.readTime}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Article Content */}
        <section className="max-w-4xl mx-auto">
          <article className="prose prose-lg dark:prose-invert max-w-none bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 md:p-12">
            <div
              className="text-foreground leading-relaxed"
              dangerouslySetInnerHTML={{ __html: article.content.replace(/bg-primary\/10/g, 'bg-green-100/50').replace(/bg-primary/g, 'bg-green-500').replace(/text-primary/g, 'text-green-600').replace(/hover:bg-primary/g, 'hover:bg-green-600').replace(/border-primary/g, 'border-green-400').replace(/bg-secondary/g, 'bg-blue-500').replace(/from-primary/g, 'from-green-100').replace(/to-secondary/g, 'to-blue-100').replace(/bg-accent\/10/g, 'bg-yellow-100/50').replace(/border-accent/g, 'border-yellow-400') }}
            />
          </article>
        </section>

        {/* Article Footer */}
        <section className="max-w-4xl mx-auto mt-16 pt-8 border-t border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <p className="text-muted-foreground text-sm mb-4">
              Written by {article.author} • {new Date(article.date).toLocaleDateString()}
            </p>
            <div className="flex items-center justify-center space-x-2">
              <div className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">☀️</span>
              </div>
              <span className="font-serif text-lg font-bold text-foreground">Solar Lgao</span>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}