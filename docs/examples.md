---
title: Examples
description: Practical examples of using the documentation MCP server
tags: [examples, use-cases]
---

# Examples

This document provides practical examples of how to use the documentation MCP server with Cursor.

## Basic Search Examples

### Finding Setup Instructions
**Query**: "How do I get started with this project?"

The MCP server will search through all documentation files for relevant content about setup, installation, or getting started.

### API Documentation Lookup
**Query**: "Show me information about authentication endpoints"

Searches for API-related content, authentication methods, and endpoint documentation.

### Troubleshooting Help
**Query**: "What should I do if the build fails?"

Finds troubleshooting guides, common issues, and solution documentation.

## Online Documentation Examples

### Adding GitHub Documentation
**Command**: "Add online documentation from https://raw.githubusercontent.com/username/repo/main/README.md with name 'Project README'"

This fetches the README file directly from GitHub and makes it searchable.

### Adding Documentation Website
**Command**: "Add online documentation from https://docs.example.com/api with name 'API Docs' with refresh interval 30 minutes"

This adds an HTML documentation page that will be refreshed every 30 minutes.

### Adding Notion Documentation
**Command**: "Add online documentation from https://notion.site/your-public-page with name 'Team Wiki'"

This adds a public Notion page and converts it to searchable markdown.

### Refreshing Online Sources
**Command**: "Refresh online documentation for https://docs.example.com/api"

Manually updates a specific online source.

### Managing Online Sources
- **List all online sources**: "What online documentation sources do I have?"
- **Remove a source**: "Remove online documentation https://old-docs.example.com"

## Advanced Search Patterns

### Technology-Specific Searches
- "How to configure Docker for this project?"
- "What are the database migration steps?"
- "How to set up testing environment?"

### Feature Documentation
- "How does the user authentication work?"
- "What are the available configuration options?"
- "How to implement custom integrations?"

### Cross-Source Search
When you have both local and online documentation, searches will include all sources:
- "Find deployment instructions" (searches local docs + online sources)
- "Show me the latest API changes" (online docs often have more recent updates)

## File Management Examples

### Listing Documentation by Type
**Tool**: `list_documentation_files`
**Filter**: `"*.md"`

Lists all Markdown files in your documentation.

### Finding Specific Sections
**Tool**: `search_documentation`
**Query**: "deployment guide"
**Limit**: 5

Returns the top 5 most relevant results about deployment.

## Online Documentation Workflows

### Connecting External Team Docs
```
1. Add team wiki: "Add online documentation from https://team.notion.so/wiki"
2. Add API docs: "Add online documentation from https://api-docs.company.com"
3. Add GitHub docs: "Add online documentation from https://github.com/company/docs"
```

### Documentation Aggregation
```
Set up multiple sources for comprehensive coverage:
- Local project docs (./docs/)
- GitHub repository README
- Company documentation site
- Third-party integration guides
```

### Real-time Documentation
```
For frequently updated docs:
- Set short refresh intervals (5-15 minutes)
- Use for API documentation, changelogs, status pages
- Monitor multiple sources for changes
```

## Integration Examples

### Project Onboarding
When a new team member joins:

1. **Start with overview**: "What is this project about?"
2. **Setup guide**: "How do I set up the development environment?"
3. **Architecture**: "What is the system architecture?"
4. **Contributing**: "How do I contribute to this project?"
5. **Latest updates**: "What are the recent changes?" (from online sources)

### Feature Development
When working on a new feature:

1. **Existing patterns**: "How are similar features implemented?"
2. **API guidelines**: "What are the API design guidelines?"
3. **Testing requirements**: "What testing is required for new features?"
4. **Documentation standards**: "How should I document this feature?"
5. **External dependencies**: "What third-party docs do I need?" (online sources)

### Debugging Sessions
When troubleshooting issues:

1. **Error patterns**: "Has this error been seen before?"
2. **Log analysis**: "How to interpret these log messages?"
3. **Performance issues**: "What are common performance bottlenecks?"
4. **Configuration problems**: "What configuration might cause this issue?"
5. **External service issues**: "Check the service status page" (online docs)

## Team Collaboration Examples

### Code Reviews
During code reviews, quickly reference:
- Style guides (local and online)
- Best practices from multiple sources
- Security requirements
- Performance guidelines from vendor docs

### Sprint Planning
When planning sprints:
- Check feature requirements documentation
- Review technical constraints from external APIs
- Understand dependencies from service documentation
- Reference user stories from online project management tools

### Knowledge Sharing
For knowledge transfer:
- Architecture decisions and rationale
- Historical context of features
- Lessons learned from past projects
- Best practices from industry documentation (online)

## Practical Workflows

### Daily Development
```
Morning standup:
"What were the action items from yesterday's planning meeting?"

Feature development:
"What are the requirements for user authentication?"

External API work:
"Show me the Stripe API documentation for payments"

Code review:
"What are our coding standards for error handling?"

End of day:
"How should I document this new feature?"
```

### Documentation Maintenance
```
Regular review:
"What documentation files haven't been updated recently?"

Content audit:
"Are there any gaps in our API documentation?"

Online source health:
"Check if all online documentation sources are accessible"

Consistency check:
"Do all setup guides follow the same format?"
```

## Use Case: Multi-Source API Documentation

### Scenario
You're integrating with multiple external APIs and need to reference documentation from various sources.

### Setup
```
1. Add Stripe docs: "Add online documentation from https://stripe.com/docs/api"
2. Add AWS docs: "Add online documentation from https://docs.aws.amazon.com/s3/"
3. Add local integration docs: Standard local file monitoring
```

### Workflow
1. **Search across all sources**: "How to handle webhook authentication?"
2. **Check specific provider**: "Show me Stripe webhook documentation"
3. **Compare approaches**: "What are the differences in error handling?"
4. **Update local docs**: Based on findings from online sources

## Use Case: Troubleshooting Guide

### Scenario
A user reports an issue and you need to find relevant troubleshooting information across multiple documentation sources.

### Workflow
1. **Search error messages**: "Database connection timeout"
2. **Check vendor docs**: Online database provider documentation
3. **Review local guides**: "What are frequent deployment problems?"
4. **External knowledge**: Stack Overflow, vendor forums (via online docs)
5. **Find escalation paths**: "Who to contact for infrastructure issues?"

## Use Case: New Developer Onboarding

### Scenario
Helping a new developer get up to speed with both internal and external documentation.

### Workflow
1. **Project overview**: "What does this application do?" (local docs)
2. **Setup instructions**: "How to set up the development environment?" (local)
3. **External services**: "What third-party services do we use?" (online docs)
4. **Architecture guide**: "What is the system architecture?" (local + online)
5. **Development workflow**: "What is our development process?" (local)
6. **External tools**: "How to use our deployment platform?" (online docs)
7. **Testing guide**: "How to run tests?" (local)
8. **Service documentation**: "How to monitor application health?" (online)

## Popular Online Documentation Sources

### Development Tools
- GitHub/GitLab repository documentation
- API documentation sites (Swagger, Postman)
- Service provider docs (AWS, Google Cloud, Azure)

### Team Collaboration
- Notion pages and databases
- Confluence spaces
- GitBook documentation

### Third-Party Services
- Payment providers (Stripe, PayPal)
- Authentication services (Auth0, Firebase)
- Monitoring tools (DataDog, New Relic)

### Open Source Projects
- Official project documentation
- Community wikis and guides
- Tutorial websites and blogs

## Tips for Better Results

### Use Specific Keywords
Instead of: "How to deploy?"
Try: "production deployment process" or "staging environment setup"

### Include Context
Instead of: "API error"
Try: "authentication API returns 401 error"

### Reference File Types
- "Show me the README file"
- "Find all markdown files about testing"
- "Search text files for configuration examples"

### Online Source Optimization
- Use specific URLs for documentation pages
- Set appropriate refresh intervals (frequent for changing docs, less for stable docs)
- Specify content type when auto-detection fails
- Use descriptive names for online sources

### Cross-Source Queries
- "Find all information about authentication" (searches all sources)
- "Show me recent changes to the API" (online sources often more current)
- "What's our internal process for deployments vs external best practices?"

### Use Metadata
If your documentation has frontmatter tags:
- "Find all files tagged with 'getting-started'"
- "Show documentation about 'api' features"
- "List files with 'tutorial' tag" 