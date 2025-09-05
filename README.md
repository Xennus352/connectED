# ConnectEd

ConnectEd is a **Next.js** application integrated with **Supabase** that enables **communication and coordination between Parents, Students, Drivers, Teachers, and Admins**. This platform allows messaging, student location tracking, attendance management, and homework assignments in a single system.

---

## Features

- Role-based contact lists: Admins, Teachers, Parents, Students, and Drivers.
- Real-time chat with unread message indicators.
- Student location tracking for drivers and parents.
- Attendance tracking for teachers and students.
- Homework management by teachers.
- Profile management with avatars and basic information.

---

## Tech Stack

- **Frontend:** Next.js 14+ (React 18+)
- **Backend:** Supabase (PostgreSQL)
- **Styling:** Tailwind CSS, DaisyUI
- **Authentication:** Supabase Auth
- **Realtime:** Supabase Realtime for messaging

---

## Prerequisites

- Node.js 20+
- npm or yarn
- Supabase account

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/connected.git
cd connected

### 2. Install dependencies
npm install
# or
yarn

3. Setup Supabase

Create a new project in Supabase
.

Create the required tables:

Table structure:

profiles:
id (uuid), username, full_name, avatar_url, role

students:
id (uuid), student_id_number, date_of_birth, enrollment_date, class_id

student_parents:
student_id (uuid), parent_id (uuid), relationship

drivers:
id (uuid), driver_id_number, license_number, license_expiry_date, assigned_vehicle, hire_date, created_at

teachers:
id (uuid), teacher_id_number, hire_date, created_at

classes:
id (uuid), school_id, name, academic_year, head_teacher_id

subjects:
id (uuid), school_id, name, grade_level

teacher_classes:
teacher_id (uuid), class_id (uuid), subject_id (uuid)

student_locations:
id (uuid), student_id (uuid), driver_id (uuid), latitude, longitude, address

attendances:
id (uuid), student_id (uuid), class_id (uuid), date, status, noted_by

homeworks:
id (uuid), class_id (uuid), title, description, due_date, assigned_by, created_at

messages:
id (uuid), sender_id (uuid), recipient_id (uuid), class_id (uuid), content, is_read (boolean default false)

### Obtain your Supabase URL and API Key from the project settings.

### Configure environment variables

### Create a .env.local file in the project root:

NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

### Run development server
npm run dev
# or
yarn dev
```
