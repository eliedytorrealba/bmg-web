<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table
                ->string('phone', 30)
                ->nullable()
                ->after('email');

            $table
                ->string('company')
                ->nullable()
                ->after('phone');

            $table
                ->string('document_type', 10)
                ->nullable()
                ->after('company');

            $table
                ->string('document_number', 30)
                ->nullable()
                ->after('document_type');

            $table
                ->index(
                    [
                        'document_type',
                        'document_number',
                    ],
                    'users_document_index',
                );
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex(
                'users_document_index',
            );

            $table->dropColumn([
                'phone',
                'company',
                'document_type',
                'document_number',
            ]);
        });
    }
};