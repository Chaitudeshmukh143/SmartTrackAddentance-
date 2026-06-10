create table if not exists users (
    id uuid primary key,
    created_at timestamp with time zone not null,
    updated_at timestamp with time zone not null,
    full_name varchar(255) not null,
    email varchar(255) not null unique,
    password_hash varchar(255) not null,
    role varchar(20) not null,
    roll_number varchar(255) unique,
    employee_id varchar(255) unique,
    department varchar(255) not null,
    semester integer,
    email_verified boolean not null,
    active boolean not null,
    last_login_at timestamp with time zone
);

create table if not exists classrooms (
    id uuid primary key,
    created_at timestamp with time zone not null,
    updated_at timestamp with time zone not null,
    class_name varchar(255) not null,
    subject_name varchar(255) not null,
    department varchar(255) not null,
    semester integer not null,
    description varchar(1200),
    join_code varchar(255) not null unique,
    archived boolean not null,
    teacher_id uuid not null references users(id)
);

create table if not exists classroom_members (
    id uuid primary key,
    classroom_id uuid not null references classrooms(id) on delete cascade,
    student_id uuid not null references users(id) on delete cascade,
    joined_at timestamp with time zone,
    unique (classroom_id, student_id)
);

create table if not exists attendance_sessions (
    id uuid primary key,
    created_at timestamp with time zone not null,
    updated_at timestamp with time zone not null,
    classroom_id uuid not null references classrooms(id) on delete cascade,
    attendance_date date not null,
    start_time timestamp with time zone not null,
    end_time timestamp with time zone,
    expires_at timestamp with time zone not null,
    allowed_radius_meters integer,
    latitude double precision,
    longitude double precision
);

create table if not exists attendance_records (
    id uuid primary key,
    session_id uuid not null references attendance_sessions(id) on delete cascade,
    student_id uuid not null references users(id) on delete cascade,
    attendance_date date not null,
    marked_at timestamp with time zone not null,
    status varchar(20) not null,
    device_fingerprint varchar(255),
    browser_visibility_compromised boolean
);

create table if not exists leave_requests (
    id uuid primary key,
    created_at timestamp with time zone not null,
    updated_at timestamp with time zone not null,
    student_id uuid not null references users(id),
    classroom_id uuid references classrooms(id),
    from_date date not null,
    to_date date not null,
    leave_type varchar(30) not null,
    reason varchar(1200) not null,
    attachment_url varchar(255),
    status varchar(20) not null
);

create table if not exists teacher_leave_requests (
    id uuid primary key,
    created_at timestamp with time zone not null,
    updated_at timestamp with time zone not null,
    teacher_id uuid not null references users(id),
    from_date date not null,
    to_date date not null,
    reason varchar(1200) not null,
    status varchar(20) not null
);

create table if not exists attendance_regularization_requests (
    id uuid primary key,
    created_at timestamp with time zone not null,
    updated_at timestamp with time zone not null,
    student_id uuid not null references users(id),
    classroom_id uuid references classrooms(id),
    attendance_date date not null,
    reason varchar(1200) not null,
    subject_name varchar(255),
    attachment_url varchar(255),
    status varchar(20) not null
);

create table if not exists announcements (
    id uuid primary key,
    created_at timestamp with time zone not null,
    updated_at timestamp with time zone not null,
    teacher_id uuid not null references users(id),
    classroom_id uuid references classrooms(id),
    title varchar(255) not null,
    message varchar(2000) not null,
    attachment_url varchar(255),
    publish_date timestamp with time zone
);

create table if not exists notifications (
    id uuid primary key,
    created_at timestamp with time zone not null,
    updated_at timestamp with time zone not null,
    user_id uuid not null references users(id),
    type varchar(40) not null,
    title varchar(255) not null,
    body varchar(1000) not null,
    read boolean not null
);

create table if not exists holidays (
    id uuid primary key,
    created_at timestamp with time zone not null,
    updated_at timestamp with time zone not null,
    name varchar(255) not null,
    type varchar(20) not null,
    holiday_date date not null,
    recurring boolean not null
);

create table if not exists messages (
    id uuid primary key,
    created_at timestamp with time zone not null,
    updated_at timestamp with time zone not null,
    sender_id uuid not null references users(id),
    recipient_id uuid references users(id),
    classroom_id uuid references classrooms(id),
    type varchar(20) not null,
    content varchar(2000) not null,
    read boolean not null
);

create table if not exists attachments (
    id uuid primary key,
    created_at timestamp with time zone not null,
    updated_at timestamp with time zone not null,
    file_name varchar(255) not null,
    storage_path varchar(255) not null,
    content_type varchar(255) not null,
    size_in_bytes bigint not null
);

create table if not exists audit_logs (
    id uuid primary key,
    created_at timestamp with time zone not null,
    updated_at timestamp with time zone not null,
    actor varchar(255) not null,
    action varchar(255) not null,
    resource_type varchar(255) not null,
    resource_id varchar(255) not null,
    metadata varchar(3000)
);

create table if not exists refresh_tokens (
    id uuid primary key,
    user_id uuid not null references users(id) on delete cascade,
    token varchar(512) not null unique,
    expires_at timestamp with time zone not null,
    revoked boolean not null
);
