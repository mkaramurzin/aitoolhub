# Clarifying Questions Feature

When a user search query is ambiguous, the application now calculates a similarity score using embeddings. If confidence is below 50%, a short clarifying question is generated using OpenAI's GPT-4o model. The user can answer this question to refine the search query and get better results. Both the original and refined queries are stored in the search history.

