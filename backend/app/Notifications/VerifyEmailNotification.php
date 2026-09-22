<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\URL;

class VerifyEmailNotification extends Notification
{
    use Queueable;

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $verificationUrl = $this->verificationUrl(
            $notifiable
        );

        return (new MailMessage)
            ->subject(
                'Verificá tu correo | BMG Distribuidora'
            )
            ->view(
                'emails.verify-email',
                [
                    'user' => $notifiable,
                    'verificationUrl' => $verificationUrl,
                ]
            );
    }

    protected function verificationUrl(
        object $notifiable
    ): string {
        return URL::temporarySignedRoute(
            'verification.verify',
            Carbon::now()->addMinutes(
                Config::get(
                    'auth.verification.expire',
                    60
                )
            ),
            [
                'id' => $notifiable->getKey(),
                'hash' => sha1(
                    $notifiable->getEmailForVerification()
                ),
            ]
        );
    }

    public function toArray(object $notifiable): array
    {
        return [];
    }
}