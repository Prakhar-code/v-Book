
# v-Book 📚🏢

**v-Book** is a full-fledged cabin booking system designed to simplify corporate planning and make booking meeting or working spaces seamless and hassle-free. With a smooth and user-friendly interface, **v-Book** lets users securely book cabins, manage their reservations, and leave reviews to assist fellow colleagues in making informed decisions. The system is built using **FastAPI** for the backend and **ReactJS**, **HTML**, and **CSS** for the frontend.

## Features 🛠️

- **User Registration and Login**: 
  - Secure authentication for users to create accounts, log in, and manage their profiles.
  
- **Cabin Listings**: 
  - Browse through available cabins with detailed descriptions, capacity, amenities, and availability.
  
- **Booking Management**: 
  - Easy booking process with real-time availability checks to avoid conflicts.

- **Reviews and Ratings**: 
  - Leave reviews and ratings for cabins to help colleagues make informed decisions about their bookings.

- **Admin Dashboard**: 
  - Manage cabin listings, monitor bookings, and control user accounts with an intuitive dashboard for administrators.

## 🛠️ Installation

### Prerequisites

- **Python** (for FastAPI backend)
- **Node.js** (for ReactJS frontend)
- **npm** (for managing frontend dependencies)

### Step 1: Set up the Backend (FastAPI)

1. Clone the repository:

   ```bash
   git clone git clone https://github.com/Prakhar-code/v-Book.git
   cd v-Book/backend
   ```

2. Install the required Python dependencies:

   ```bash
   pip install -r requirements.txt
   ```

3. Run the FastAPI server:

   ```bash
   uvicorn app.run:app --reload
   ```

4. The backend should now be running on `http://localhost:8000`.

### Step 2: Set up the Frontend (ReactJS)

1. Navigate to the frontend directory:

   ```bash
   cd /frontend/frontend-vbook
   ```

2. Install the required npm dependencies:

   ```bash
   npm install
   ```

3. Start the React development server:

   ```bash
   npm start
   ```

4. The frontend should now be accessible at `http://localhost:3000`.

### Step 3: Configuration (Optional)

You can configure various aspects of the system by editing the configuration files for the backend and frontend. This includes modifying the cabin types, booking rules, and user roles.

## 📝 Usage

### 1. **User Registration and Login**
   - **Sign Up**: New users can register by providing basic information like email, password, and company details.
   - **Log In**: Returning users can securely log in with their credentials.

### 2. **Cabin Listings**
   - Users can browse through a variety of cabins available for booking. Each listing includes details such as:
     - Cabin Name
     - Capacity
     - Available Amenities
     - Availability Status
     - Cabin Description

### 3. **Booking a Cabin**
   - Select a cabin from the listings and choose your desired date and time.
   - The system performs a real-time check for availability.
   - Once confirmed, users can finalize the booking with a single click.

### 4. **Leaving Reviews and Ratings**
   - After using a cabin, users can leave feedback in the form of reviews and ratings to help other colleagues make informed booking decisions.

### 5. **Admin Dashboard**
   - Admin users can access the dashboard to:
     - Add or remove cabins.
     - View and manage all bookings.
     - Manage user accounts and permissions.

## 💡 Why Use v-Book?

- **Streamlined Corporate Planning**: Makes cabin booking for meetings or workspaces easy and organized, reducing scheduling conflicts.
- **Real-Time Availability**: Avoid double-bookings with automatic availability checks.
- **Transparency Through Reviews**: User reviews and ratings ensure that colleagues can make informed decisions based on firsthand experiences.
- **Admin Control**: Full control over cabin listings, bookings, and user management.

## ⚡ Contributing

We welcome contributions to v-Book! If you'd like to help improve the project, please follow these steps:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature/your-feature-name`).
3. Make your changes and commit them (`git commit -am 'Add new feature'`).
4. Push to your branch (`git push origin feature/your-feature-name`).
5. Open a pull request with a clear description of your changes.


---

This README provides an overview of the project, its installation process, usage instructions, and contributing guidelines. You can modify or extend any section to fit your project better!
