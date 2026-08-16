<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_addresses', function (Blueprint $table) {
            $table->id();

            $table
                ->foreignId('user_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->string('type', 20);

            $table->string('street');

            $table->string(
                'number',
                30,
            );

            $table
                ->string('floor_apartment')
                ->nullable();

            $table->string('city');

            $table->string('province');

            $table
                ->string('postal_code', 20)
                ->nullable();

            $table
                ->text('notes')
                ->nullable();

            $table->timestamps();

            $table->unique([
                'user_id',
                'type',
            ]);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists(
            'user_addresses',
        );
    }
};