## Possible Ideas & TODOs


### Completed / Implemented

- Backend API calls fully functional  
- Token-based authentication implemented  
- CRUD operations for training plans, workout logs, and users working correctly  
- Postman integrations tested and working  
- Basic UI screens for login, signup, profile setup, and training plans built and connected
- Build an intuitive and stylish interface for logging and tracking workouts.
- Separate API calls into service layers for cleaner code and easier testing.  
- Filled up Database with various exercises
- Changed Schema so exercises are not embedded into trainingplans instead, they are referenced --> so we are able to implement a search function for exercises

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
- **Important**
  - Need to add a LoadingContext to load every data before logging in, so there is no need to request every api call again --> mostly recommendable --> but need to 
    figure out what is always requested and can be stored upon app usage

- **Features to be implemented**
  - To let the user have individual workouts and reuse them, it would make sense to add another collection to the backend ("workout templates"), so the user can 
    train after a plan but also include workouts offplan 
  - After clicking on a Workout day, there needs to be a screen showing exercises, duration, etc
  - To let the user see what exercises are, there needs to be atleast a picture --> need to fill up the database with according exercise picture
  - Need to add more features on analytics API endpoint, to allow user to see workout history, hours trained, muscle type used, workouts logged this month, prs, volume
    increase, missed sessions
  - Need to fill up the database with training plans 
  - Need to style the Search Screen accordingly
  - Add feature in HomeScreen for when user don't know what to train? --> Add questionare and baseed on questionaire recommend the user trainingplans or workouts they
    can train right now
  - Add feature in HomeScreen for when user is currently recovering --> Add questionare and based on questionaire recommend rehabilitation exercises and warmups
  - Add Exercise Screen showing information to the exercise --> Would be good to have a video with scrolling down seeing information on how the exercise is done and 
    what muscle groups the exercise targets
  - Need to change the style for adding new training plans (currently modal needs to be redone)
  - Stopwatch/Timer after reaching the time needs to buzz
  - Add Notifications (e.g. Workout logged, Missed workout..., reminder for upcoming workout, etc)
  - Needs to have a confirmation modal showing the user what was logged today (volume or volume increasment compared to planned one - only viable if user trains after
    trainingplan otherwise show what exercises were logged and if there are prs )
  - LogScreen needs to be updated for Rest Days 
  - Need to figure out how to display metrics received from HealthConnect on HomeScreen (maybe toggle mode, maybe new card)
  - Need to redesign ProfileScreen


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