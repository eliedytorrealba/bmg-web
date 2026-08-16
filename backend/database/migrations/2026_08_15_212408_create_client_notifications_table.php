<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('client_notifications', function (Blueprint $table) {
            $table->id();

            $table
                ->foreignId('user_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->string('title', 150);

            $table->text('message');

            $table
                ->boolean('is_read')
                ->default(false);

            $table
                ->timestamp('expires_at')
                ->nullable();

            $table
                ->timestamp('read_at')
                ->nullable();

            $table->timestamps();

            $table->index([
                'user_id',
                'is_read',
            ]);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists(
            'client_notifications',
        );
    }
};