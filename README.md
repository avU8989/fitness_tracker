## Possible Ideas & TODOs


### Completed / Implemented

- Backend API calls fully functional  
- Token-based authentication implemented  
- CRUD operations for training plans, workout logs, and users working correctly  
- Postman integrations tested and working  
- Basic UI screens for login, signup, profile setup, and training plans built and connected
- Build an intuitive and stylish interface for logging and tracking workouts.
- Separate API calls into service layers for cleaner code and easier testing.  

### Possible Ideas

- **AI Coach: Workout Logging Reminders**  
  - If the user *does not* log workouts, the AI Coach sends reminders or “gets mad” like Duolingo’s encouragement.

- **AI Coach: Reward System**  
  - Users earn points for logging workouts consistently.  
  - Points unlock rewards, such as allowing cheat meals.

- **Gamification System with AI Coach**  
  - Create a gamified experience featuring the AI Coach to motivate and engage users.  
  - Visualize progress and rewards in an interactive UI.

- **API Integrations with Smart Watches / Wearables**  
  - Sync data from devices like Apple Watch, Fitbit, Garmin, etc.  
  - Track sleep quality, step count, heart rate, and other health metrics.

Failure Mode

If you skip workouts, the VHS “corrupts” — static, glitching UI, distorted voiceovers:
“TAPE ERROR: You can’t skip leg day.”

Rival Mode

Add a fake “rival lifter” (like in old bodybuilding tapes) that you’re always compared against.

The rival’s numbers scale based on your logs, pushing you to beat them.

📼 VHS Gacha System for Fitness Tracker
opening a tape will get you another rival if you beat the rival you conquered that one. rival can have workoutstreak prob. higher than yours
rival can differ in top prs maybe (squat 10kg more than yours, so your goal would be a more leg workout and stuff like that) 

Baki like rivals you can earn by opening tapes

gacha system, health metrics (steps) deal dmg to bossfights, workouts to deal bossfights early game is simple logging workout, 
logging workout earns coins, coins open packs unlock rivals mid game earn- user has some rivals, 
but needs to beat em in order to conquer them (logging a workout that is greater than of the rival), 
story approach user is in a tower like system, each floor represents sum dummy monsters 
- every 10th floor a boss appears -> beating that the 100th gives the user a legendary rival (which he immediately gets, no need to log workout again to aquire rival) 
endgame- user has enough rivals and legendary rivals, joins a guild --> guild beats own raid boss (every week one appears), guild can also have battles with other guilds
---

### TODOs / Refactoring & Improvements

- **Refactor**  
  - Improve state management for authentication and user data.  
  - Modularize components and styles for better maintainability.

- **Security**  
  - Add cyber attacks testing / security audits (penetration testing, vulnerability scanning)

- **Error Handling**  
  - Standardize API error handling and display informative messages in the UI.

- **Testing**  
  - Add unit and integration tests for critical components and API services.

- **Performance**  
  - Optimize animations and screen transitions for smoother UX.

- **UX Enhancements**  
  - Improve onboarding flow and setup screens.  
  - Add contextual help or tooltips for complex features.
  - Need to make LogScreen & HomeScreen more intuitive
  - Need to add a light Mode
  - Cancel Button in TrainingPlansScreen needs to be lighter