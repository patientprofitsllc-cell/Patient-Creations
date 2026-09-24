# Patient Creations: the audits

Each audit is a command with a fixed route (which agents wake) and fixed components (how the problem is divided). Findings
are ranked P0 to P4, and nothing is called critical without an observed fact behind it.

| Command | Agents woken | Divided into | Reads |
|---|---|---|---|
| AUDIT_WEBSITE | GATHERER, LOOK, PERSPECTIVE, FEELINGS, IMAGE, THINKING, LOGIC, ORGANIZER | the website | The home, services, audit, and checkout pages |
| AUDIT_PRODUCTS | DIVIDER, GATHERER, LOOK, PERSPECTIVE, FEELINGS, THINKING, LOGIC, ORGANIZER, SPEAKER | products, how they are shown, what to offer next | The catalog, the pages, expansion and retention |
| AUDIT_CUSTOMER_JOURNEY | DIVIDER, GATHERER, LOOK, PERSPECTIVE, FEELINGS, THINKING, LOGIC, ORGANIZER, SPEAKER | awareness, understanding and trust, selection, checkout, delivery, follow-up, referral, repeat | Funnel events, pages, delivery, experience, partners |
| AUDIT_BUSINESS | All ten | the ten parts of the business | Everything above |
| ANALYZE_GROWTH | DIVIDER, GATHERER, PERSPECTIVE, THINKING, LOGIC, ORGANIZER, SPEAKER | acquisition, conversion, order value, retention, referral, operations | The bottleneck stages, funnel, catalog, systems, partners |
| ANALYZE_CUSTOMERS | DIVIDER, GATHERER, PERSPECTIVE, FEELINGS, THINKING, LOGIC, ORGANIZER, SPEAKER | who buys and stays, their experience | Retention, expansion, reviews, messages |
| ANALYZE_CONVERSION | DIVIDER, GATHERER, LOOK, PERSPECTIVE, FEELINGS, THINKING, LOGIC, ORGANIZER, SPEAKER | who arrives, where people stop, what the pages say | Visitors, funnel, pages |
| GENERATE_STRATEGY | GATHERER, PERSPECTIVE, THINKING, LOGIC, ORGANIZER, SPEAKER | the constraint, money | Bottleneck stages, cash |
| RUN_RESEARCH | DIVIDER, GATHERER, THINKING, LOGIC, ORGANIZER, SPEAKER | what is already known | Connected data only. Outside research is a task for a person |

## The website audit, in detail

For each page LOOK reports what is there (title, one main heading, mobile layout, navigation, calls to action, forms, text),
what looks confusing (competing actions, long paragraphs, long forms), what looks missing (no heading, no contact, no price on a
page that should have one), and what to improve, each with the reason. IMAGE lists the gaps (no share image, missing alt text,
no picture) and writes a specification for each asset, marked not generated. FEELINGS says where a buyer may hesitate.

What a page is **expected** to show is set per page: the checkout page is expected to have a form and a price; the services page a
price and a call to action. A missing item is a finding only where it is expected.

**Not covered:** whether the design is good. A person, or a screenshot-capable model, is needed for that. LOOK says so every time.

## The rules for pricing and products

The products audit never changes a price and never suggests a number the price list does not hold. Any idea that would change a price
(for example a bundle test) is an experiment, labeled as one, and a draft that needs the owner's approval.
