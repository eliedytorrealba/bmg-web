<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('quotes', function (Blueprint $table) {
            $table->id();

            $table->string('customer_name');
            $table->string('company')->nullable();
            $table->string('email');
            $table->string('phone');

            $table->text('message')->nullable();

            $table->json('items');
            $table->unsignedInteger('total_items');
            $table->decimal('subtotal', 12, 2)->default(0);

            $table->string('status')->default('pending');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('quotes');
    }
};