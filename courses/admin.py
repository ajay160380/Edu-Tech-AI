from django.contrib import admin
from .models import UserProfile, Course, Video, Progress, StudySession

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'streak_count', 'last_active_date', 'daily_target_videos')
    search_fields = ('user__username', 'user__email')

@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ('title', 'user', 'playlist_id', 'target_days', 'created_at')
    search_fields = ('title', 'user__username', 'playlist_id')
    list_filter = ('created_at',)

@admin.register(Video)
class VideoAdmin(admin.ModelAdmin):
    list_display = ('title', 'course', 'youtube_video_id', 'order')
    search_fields = ('title', 'course__title', 'youtube_video_id')
    list_filter = ('course',)

@admin.register(Progress)
class ProgressAdmin(admin.ModelAdmin):
    list_display = ('user', 'video', 'completed_at', 'is_completed')
    search_fields = ('user__username', 'video__title')
    list_filter = ('is_completed', 'completed_at')

@admin.register(StudySession)
class StudySessionAdmin(admin.ModelAdmin):
    list_display = ('user', 'course', 'duration_minutes', 'completed_date')
    search_fields = ('user__username', 'course__title')
    list_filter = ('completed_date',)
