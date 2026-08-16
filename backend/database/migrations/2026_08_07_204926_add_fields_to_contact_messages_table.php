<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table(
            'contact_messages',
            function (Blueprint $table): void {
                $table
                    ->string('name', 150)
                    ->after('id');

                $table
                    ->string('company', 150)
                    ->nullable()
                    ->after('name');

                $table
                    ->string('email', 150)
                    ->after('company');

                $table
                    ->string('phone', 20)
                    ->after('email');

                $table
                    ->string('subject', 150)
                    ->after('phone');

                $table
                    ->text('message')
                    ->after('subject');

                $table
                    ->string('status', 30)
                    ->default('pending')
                    ->after('message');
            },
        );
    }

    public function down(): void
    {
        Schema::table(
            'contact_messages',
            function (Blueprint $table): void {
                $table->dropColumn([
                    'name',
                    'company',
                    'email',
                    'phone',
                    'subject',
                    'message',
                    'status',
                ]);
            },
        );
    }
};