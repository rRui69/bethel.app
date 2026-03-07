<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Admin\AdminBaseController;
use App\Models\SacramentType;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str;

class SacramentTypeController extends AdminBaseController
{
    // ── Page shell ────────────────────────────────────────────────

    public function page()
    {
        $adminData = $this->adminShellData();
        return view('admin.sacrament-types', compact('adminData'));
    }

    // ── Admin API: list all ───────────────────────────────────────

    public function index(): JsonResponse
    {
        $types = SacramentType::orderBy('sort_order')->orderBy('name')->get()
            ->map(fn ($t) => [
                'id'          => $t->id,
                'name'        => $t->name,
                'slug'        => $t->slug,
                'description' => $t->description,
                'icon'        => $t->icon,
                'icon_color'  => $t->icon_color,
                'icon_bg'     => $t->icon_bg,
                'is_active'   => $t->is_active,
                'sort_order'  => $t->sort_order,
                'form_schema' => $t->form_schema ?? ['fields' => []],
                'field_count' => count($t->form_schema['fields'] ?? []),
                'created_at'  => $t->created_at->format('M d, Y'),
            ]);

        return response()->json(['data' => $types]);
    }

    // ── Admin API: single ─────────────────────────────────────────

    public function show(SacramentType $sacramentType): JsonResponse
    {
        return response()->json([
            'id'          => $sacramentType->id,
            'name'        => $sacramentType->name,
            'slug'        => $sacramentType->slug,
            'description' => $sacramentType->description,
            'icon'        => $sacramentType->icon,
            'icon_color'  => $sacramentType->icon_color,
            'icon_bg'     => $sacramentType->icon_bg,
            'is_active'   => $sacramentType->is_active,
            'sort_order'  => $sacramentType->sort_order,
            'form_schema' => $sacramentType->form_schema ?? ['fields' => []],
        ]);
    }

    // ── Admin API: create ─────────────────────────────────────────

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name'                     => 'required|string|max:100',
            'description'              => 'nullable|string|max:500',
            'icon'                     => 'required|string|max:40',
            'icon_color'               => 'required|string|max:20',
            'icon_bg'                  => 'required|string|max:20',
            'is_active'                => 'boolean',
            'sort_order'               => 'integer|min:0',
            'form_schema'              => 'nullable|array',
            'form_schema.fields'       => 'nullable|array',
            'form_schema.fields.*.id'       => 'required|string',
            'form_schema.fields.*.type'     => 'required|in:short_text,long_text,date,time,file,radio,checkbox,phone,number',
            'form_schema.fields.*.label'    => 'required|string|max:200',
            'form_schema.fields.*.required' => 'boolean',
            'form_schema.fields.*.options'  => 'nullable|array',
        ]);

        $validated['slug']       = SacramentType::uniqueSlug($validated['name']);
        $validated['created_by'] = auth()->id();

        $type = SacramentType::create($validated);

        return response()->json([
            'message' => 'Sacrament type created.',
            'id'      => $type->id,
            'slug'    => $type->slug,
        ], 201);
    }

    // ── Admin API: update ─────────────────────────────────────────

    public function update(Request $request, SacramentType $sacramentType): JsonResponse
    {
        $validated = $request->validate([
            'name'                     => 'sometimes|required|string|max:100',
            'description'              => 'nullable|string|max:500',
            'icon'                     => 'sometimes|required|string|max:40',
            'icon_color'               => 'sometimes|required|string|max:20',
            'icon_bg'                  => 'sometimes|required|string|max:20',
            'is_active'                => 'boolean',
            'sort_order'               => 'integer|min:0',
            'form_schema'              => 'nullable|array',
            'form_schema.fields'       => 'nullable|array',
            'form_schema.fields.*.id'       => 'required|string',
            'form_schema.fields.*.type'     => 'required|in:short_text,long_text,date,time,file,radio,checkbox,phone,number',
            'form_schema.fields.*.label'    => 'required|string|max:200',
            'form_schema.fields.*.required' => 'boolean',
            'form_schema.fields.*.options'  => 'nullable|array',
        ]);

        // Regenerate slug only if name changed
        if (isset($validated['name']) && $validated['name'] !== $sacramentType->name) {
            $validated['slug'] = SacramentType::uniqueSlug($validated['name'], $sacramentType->id);
        }

        $sacramentType->update($validated);

        return response()->json([
            'message' => 'Sacrament type updated.',
            'slug'    => $sacramentType->slug,
        ]);
    }

    // ── Admin API: toggle active ──────────────────────────────────

    public function toggle(SacramentType $sacramentType): JsonResponse
    {
        $sacramentType->update(['is_active' => ! $sacramentType->is_active]);

        return response()->json([
            'is_active' => $sacramentType->is_active,
            'message'   => $sacramentType->is_active ? 'Sacrament activated.' : 'Sacrament deactivated.',
        ]);
    }

    // ── Admin API: destroy ────────────────────────────────────────

    public function destroy(SacramentType $sacramentType): JsonResponse
    {
        // Keep request records intact — sacrament_type_id nulls via nullOnDelete()
        $sacramentType->delete();

        return response()->json(['message' => 'Sacrament type deleted.']);
    }

    // ── Admin API: reorder ────────────────────────────────────────

    public function reorder(Request $request): JsonResponse
    {
        $request->validate([
            'order'   => 'required|array',
            'order.*' => 'integer|exists:sacrament_types,id',
        ]);

        foreach ($request->order as $i => $id) {
            SacramentType::where('id', $id)->update(['sort_order' => $i]);
        }

        return response()->json(['message' => 'Order saved.']);
    }

    // ── Public API: active list (no auth) ─────────────────────────

    public function publicIndex(): JsonResponse
    {
        $types = SacramentType::active()
            ->select('id', 'name', 'slug', 'description', 'icon', 'icon_color', 'icon_bg')
            ->get()
            ->map(fn ($t) => [
                'id'          => $t->id,
                'name'        => $t->name,
                'slug'        => $t->slug,
                'description' => $t->description,
                'icon'        => $t->icon,
                'icon_color'  => $t->icon_color,
                'icon_bg'     => $t->icon_bg,
                'href'        => "/sacraments/{$t->slug}",
            ]);

        return response()->json(['data' => $types]);
    }
}