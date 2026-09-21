<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('quotes', function (Blueprint $table) {
            $table
                ->decimal('final_total', 12, 2)
                ->nullable()
                ->after('subtotal');
        });

        DB::table('quotes')->update([
            'final_total' => DB::raw('subtotal'),
        ]);
    }

    public function down(): void
    {
        Schema::table('quotes', function (Blueprint $table) {
            $table->dropColumn('final_total');
        });
    }
};